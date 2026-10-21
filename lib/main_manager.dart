import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/app_theme.dart';
import 'server/host_service.dart';
import 'ui/manager/screens/manager_dashboard_screen.dart';
import 'ui/manager/screens/room_management_screen.dart';
import 'ui/manager/screens/alerts_hub_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set Android system overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize and boot the local Shelf Host Server (Port 8080)
  final hostService = HostService();
  await hostService.startServer();

  runApp(const BoardMateManagerApp());
}

class BoardMateManagerApp extends StatelessWidget {
  const BoardMateManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BoardMate Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF5F7FF),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F6BED),
          primary: const Color(0xFF4F6BED),
        ),
        fontFamily: 'Plus Jakarta Sans',
      ),
      home: const ManagerRootShell(),
    );
  }
}

class ManagerRootShell extends StatefulWidget {
  const ManagerRootShell({super.key});

  @override
  State<ManagerRootShell> createState() => _ManagerRootShellState();
}

class _ManagerRootShellState extends State<ManagerRootShell> {
  bool _isUnlocked = false;
  final TextEditingController _pinController = TextEditingController();
  final String _masterPin = "1234"; // Manager 4-digit PIN

  int _currentIndex = 0;

  void _verifyPin() {
    if (_pinController.text == _masterPin) {
      setState(() => _isUnlocked = true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Incorrect PIN. Default is 1234.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isUnlocked) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircleAvatar(
                  radius: 36,
                  backgroundColor: Color(0xFFE8ECFF),
                  child: Text('👩‍💼', style: TextStyle(fontSize: 36)),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Aling Nena',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1F2544)),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Santos Boarding House • Host Device',
                  style: TextStyle(color: Color(0xFF6B7194), fontSize: 13),
                ),
                const SizedBox(height: 32),
                TextField(
                  controller: _pinController,
                  obscureText: true,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  maxLength: 4,
                  style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    hintText: '••••',
                    counterText: '',
                    labelText: 'Enter 4-Digit Manager PIN (1234)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _verifyPin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F6BED),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Unlock Dashboard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final pages = [
      ManagerDashboardScreen(
        onOpenAlerts: () => setState(() => _currentIndex = 2),
        onOpenRooms: () => setState(() => _currentIndex = 1),
        onOpenBilling: () {},
      ),
      const RoomManagementScreen(),
      const AlertsHubScreen(),
    ];

    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.meeting_room_outlined), selectedIcon: Icon(Icons.meeting_room), label: 'Rooms'),
          NavigationDestination(icon: Icon(Icons.notifications_outlined), selectedIcon: Icon(Icons.notifications), label: 'Alerts'),
        ],
      ),
    );
  }
}
