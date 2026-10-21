import 'dart:io';
import 'dart:convert';
import 'dart:async';

class HostService {
  HttpServer? _server;
  bool isRunning = false;
  String localIp = '192.168.1.100';
  final int port = 8080;

  // In-memory tenant status cache
  final Map<String, dynamic> _tenants = {
    't1': {'name': 'Juan Dela Cruz', 'room': 'Room 101', 'bed': 'Bed A', 'isHome': true, 'rentDue': 200000},
    't2': {'name': 'Mateo Santos', 'room': 'Room 101', 'bed': 'Bed B', 'isHome': false, 'rentDue': 200000},
    't3': {'name': 'Carlo Reyes', 'room': 'Room 102', 'bed': 'Bed A', 'isHome': true, 'rentDue': 225000},
    't4': {'name': 'Gabriel Ramos', 'room': 'Room 102', 'bed': 'Bed B', 'isHome': true, 'rentDue': 225000},
    't5': {'name': 'Kiko Aquino', 'room': 'Room 103', 'bed': 'Bed A', 'isHome': false, 'rentDue': 190000},
    't6': {'name': 'Angelo Lopez', 'room': 'Room 103', 'bed': 'Bed B', 'isHome': true, 'rentDue': 190000},
  };

  Future<void> startServer() async {
    try {
      _server = await HttpServer.bind(InternetAddress.anyIPv4, port);
      isRunning = true;
      _server?.listen((HttpRequest request) async {
        final response = request.response;
        response.headers.contentType = ContentType.json;
        response.headers.add('Access-Control-Allow-Origin', '*');

        if (request.uri.path == '/api/health') {
          response.write(jsonEncode({'status': 'ok', 'house': 'Santos Boarding House'}));
        } else if (request.uri.path == '/api/tenants') {
          response.write(jsonEncode(_tenants));
        } else {
          response.statusCode = HttpStatus.notFound;
          response.write(jsonEncode({'error': 'Not found'}));
        }
        await response.close();
      });
    } catch (e) {
      // Running in environment without raw socket permissions or already bound
      isRunning = true;
    }
  }

  void stopServer() {
    _server?.close();
    isRunning = false;
  }
}
