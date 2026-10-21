import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'ui/tenant/screens/tenant_home_screen.dart';
import 'ui/tenant/screens/problem_reporter_screen.dart';
import 'ui/tenant/screens/qr_scanner_screen.dart';
import 'ui/tenant/screens/privacy_consent_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const BoardMateTenantApp());
}

class BoardMateTenantApp extends StatelessWidget {
  const BoardMateTenantApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BoardMate Tenant',
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
      home: const TenantRootShell(),
    );
  }
}

class TenantRootShell extends StatefulWidget {
  const TenantRootShell({super.key});

  @override
  State<TenantRootShell> createState() => _TenantRootShellState();
}

class _TenantRootShellState extends State<TenantRootShell> {
  bool _isPaired = false;
  bool _hasConsented = false;
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    // 1. First-run: Philippine Data Privacy Consent (RA 10173)
    if (!_hasConsented) {
      return PrivacyConsentScreen(
        onAccept: () => setState(() => _hasConsented = true),
        onDecline: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Consent is required to connect to the house host.')),
          );
        },
      );
    }

    // 2. Second-run: QR Pairing with Manager phone
    if (!_isPaired) {
      return Scaffold(
        body: QrScannerScreen(
          onPairingSuccess: (payload) {
            setState(() => _isPaired = true);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Connected to ${payload.houseName}! Assigned: ${payload.tenantId}')),
            );
          },
        ),
      );
    }

    // 3. Paired Tenant Experience
    final pages = [
      TenantHomeScreen(
        onPayRent: () {},
        onReportProblem: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (ctx) => ProblemReporterScreen(
                onSubmitReport: (data) {},
              ),
            ),
          );
        },
        onEmergency: () {},
        onOpenRoom: () {},
      ),
      ProblemReporterScreen(onSubmitReport: (data) {}),
    ];

    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.build_circle_outlined), selectedIcon: Icon(Icons.build_circle), label: 'Report Issue'),
        ],
      ),
    );
  }
}
