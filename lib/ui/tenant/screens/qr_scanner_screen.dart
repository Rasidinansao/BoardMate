import 'package:flutter/material.dart';

class PairingPayload {
  final String houseName;
  final String tenantId;
  final String hostIp;
  final int port;

  PairingPayload({
    required this.houseName,
    required this.tenantId,
    required this.hostIp,
    required this.port,
  });
}

class QrScannerScreen extends StatefulWidget {
  final Function(PairingPayload) onPairingSuccess;

  const QrScannerScreen({super.key, required this.onPairingSuccess});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final TextEditingController _ipController = TextEditingController(text: '192.168.1.100');
  String _selectedTenant = 'Juan Dela Cruz (Bed 101-A)';

  void _simulatePairing() {
    widget.onPairingSuccess(
      PairingPayload(
        houseName: 'Santos Boarding House',
        tenantId: _selectedTenant,
        hostIp: _ipController.text,
        port: 8080,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Pair with Manager Device'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 10),
            // QR Viewport Simulation
            Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF0D9488), width: 3),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  const Icon(Icons.qr_code_scanner, size: 100, color: Color(0xFF0D9488)),
                  Positioned(
                    bottom: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'Align Landlady QR Code',
                        style: TextStyle(color: Colors.white, fontSize: 11),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            const Text(
              'Connect to Santos-Boarding-WiFi',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 4),
            const Text(
              'Point your camera at the QR code displayed on the manager phone to pair your bed.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),

            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 16),

            // Manual Pairing Fallback
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Manual Host IP Pairing (Fallback):',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF334155)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _ipController,
              decoration: const InputDecoration(
                labelText: 'Host Local IP Address',
                hintText: '192.168.1.100',
                prefixIcon: Icon(Icons.wifi, color: Color(0xFF0D9488)),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selectedTenant,
              decoration: const InputDecoration(
                labelText: 'Select Your Bed Assignment',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'Juan Dela Cruz (Bed 101-A)', child: Text('Juan Dela Cruz (Bed 101-A)')),
                DropdownMenuItem(value: 'Mateo Santos (Bed 101-B)', child: Text('Mateo Santos (Bed 101-B)')),
                DropdownMenuItem(value: 'Carlo Reyes (Bed 102-A)', child: Text('Carlo Reyes (Bed 102-A)')),
                DropdownMenuItem(value: 'Gabriel Ramos (Bed 102-B)', child: Text('Gabriel Ramos (Bed 102-B)')),
                DropdownMenuItem(value: 'Kiko Aquino (Bed 103-A)', child: Text('Kiko Aquino (Bed 103-A)')),
                DropdownMenuItem(value: 'Angelo Lopez (Bed 103-B)', child: Text('Angelo Lopez (Bed 103-B)')),
              ],
              onChanged: (val) => setState(() => _selectedTenant = val!),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _simulatePairing,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.link, color: Colors.white),
                label: const Text('Complete Pairing & Enter App', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
