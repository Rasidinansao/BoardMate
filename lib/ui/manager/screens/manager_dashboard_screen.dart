import 'package:flutter/material.dart';
import '../../../core/utils/currency_utils.dart';

class ManagerDashboardScreen extends StatefulWidget {
  final VoidCallback onOpenAlerts;
  final VoidCallback onOpenRooms;
  final VoidCallback onOpenBilling;

  const ManagerDashboardScreen({
    super.key,
    required this.onOpenAlerts,
    required this.onOpenRooms,
    required this.onOpenBilling,
  });

  @override
  State<ManagerDashboardScreen> createState() => _ManagerDashboardScreenState();
}

class _ManagerDashboardScreenState extends State<ManagerDashboardScreen> {
  int totalCollectedCentavos = 850000; // ₱8,500.00
  int totalTargetCentavos = 1230000; // ₱12,300.00
  int pendingReportsCount = 2;

  final List<Map<String, dynamic>> _tenants = [
    {'name': 'Juan Dela Cruz', 'room': 'Room 101', 'bed': 'Bed A', 'isHome': true, 'rentStatus': 'Paid', 'lastSeen': 'Just now'},
    {'name': 'Mateo Santos', 'room': 'Room 101', 'bed': 'Bed B', 'isHome': false, 'rentStatus': 'Pending', 'lastSeen': '2 hrs ago'},
    {'name': 'Carlo Reyes', 'room': 'Room 102', 'bed': 'Bed A', 'isHome': true, 'rentStatus': 'Paid', 'lastSeen': 'Just now'},
    {'name': 'Gabriel Ramos', 'room': 'Room 102', 'bed': 'Bed B', 'isHome': true, 'rentStatus': 'Paid', 'lastSeen': '10 mins ago'},
    {'name': 'Kiko Aquino', 'room': 'Room 103', 'bed': 'Bed A', 'isHome': false, 'rentStatus': 'Pending', 'lastSeen': '4 hrs ago'},
    {'name': 'Angelo Lopez', 'room': 'Room 103', 'bed': 'Bed B', 'isHome': true, 'rentStatus': 'Paid', 'lastSeen': 'Just now'},
  ];

  @override
  Widget build(BuildContext context) {
    final homeCount = _tenants.where((t) => t['isHome'] == true).length;
    final awayCount = _tenants.length - homeCount;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Santos Boarding House', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            Text('Host IP: 192.168.1.100:8080 • Santos-WiFi', style: TextStyle(fontSize: 11, color: Color(0xFF0D9488))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_2, color: Color(0xFF0D9488)),
            tooltip: 'Show Pairing QR',
            onPressed: () => _showPairingQrDialog(context),
          ),
          IconButton(
            icon: Badge(
              label: Text('$pendingReportsCount'),
              child: const Icon(Icons.notifications_outlined),
            ),
            onPressed: widget.onOpenAlerts,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // WiFi Presence Overview Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('WiFi Presence Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Row(
                        children: [
                          Icon(Icons.wifi, size: 16, color: Color(0xFF0D9488)),
                          SizedBox(width: 4),
                          Text('Santos-Boarding-WiFi', style: TextStyle(fontSize: 11, color: Color(0xFF0D9488), fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('$homeCount of 6 Tenants', style: const TextStyle(color: Color(0xFF065F46), fontWeight: FontWeight.bold, fontSize: 16)),
                              const Text('🏠 In House (Home)', style: TextStyle(color: Color(0xFF047857), fontSize: 12)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFCBD5E1)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('$awayCount Tenants', style: const TextStyle(color: Color(0xFF334155), fontWeight: FontWeight.bold, fontSize: 16)),
                              const Text('🚶 Outside (Away)', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Financial Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0D9488), Color(0xFF0F766E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Current Month Rent Collection', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        CurrencyUtils.formatPesos(totalCollectedCentavos),
                        style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Target: ${CurrencyUtils.formatPesos(totalTargetCentavos)}',
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  LinearProgressIndicator(
                    value: totalCollectedCentavos / totalTargetCentavos,
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Tenant Live Roster Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('All Tenants (6 Beds)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                TextButton(
                  onPressed: widget.onOpenRooms,
                  child: const Text('Manage Rooms', style: TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.bold)),
                ),
              ],
            ),

            // Tenant List
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _tenants.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final t = _tenants[index];
                final isHome = t['isHome'] as bool;

                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: isHome ? const Color(0xFFECFDF5) : const Color(0xFFF1F5F9),
                        child: Text(isHome ? '🏠' : '🚶', style: const TextStyle(fontSize: 16)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(t['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Text('${t['room']} • ${t['bed']}', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isHome ? const Color(0xFFECFDF5) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              isHome ? 'Home' : 'Away',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isHome ? const Color(0xFF047857) : const Color(0xFF64748B),
                              ),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(t['lastSeen'] as String, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showPairingQrDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Tenant Pairing QR Code'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFCBD5E1)),
              ),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.qr_code, size: 100, color: Color(0xFF0D9488)),
                    SizedBox(height: 8),
                    Text('192.168.1.100:8080', style: TextStyle(fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Ask tenant to open BoardMate Tenant App and scan this code on Santos-Boarding-WiFi.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
        ],
      ),
    );
  }
}
