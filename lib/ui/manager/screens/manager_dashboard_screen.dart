import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
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
  final int totalCollectedCentavos = 750000; // ₱7,500.00
  final int totalTargetCentavos = 1500000;   // ₱15,000.00
  final int pendingReportsCount = 1;

  final List<Map<String, dynamic>> _tenants = [
    {'name': 'Maria Santos', 'first': 'Maria', 'room': 'Room A', 'bed': 'Lower bed', 'isHome': true, 'pres': 'home', 'status': 'paid', 'seen': '6:15 PM'},
    {'name': 'Joy Dela Cruz', 'first': 'Joy', 'room': 'Room A', 'bed': 'Upper bed', 'isHome': false, 'pres': 'away', 'status': 'pending', 'seen': '8:02 AM'},
    {'name': 'Paolo Reyes', 'first': 'Paolo', 'room': 'Room B', 'bed': 'Lower bed', 'isHome': true, 'pres': 'home', 'status': 'overdue', 'seen': '7:30 PM'},
    {'name': 'Mark Villanueva', 'first': 'Mark', 'room': 'Room B', 'bed': 'Upper bed', 'isHome': true, 'pres': 'home', 'status': 'paid', 'seen': '7:41 PM'},
    {'name': 'Angel Bautista', 'first': 'Angel', 'room': 'Room C', 'bed': 'Lower bed', 'isHome': false, 'pres': 'away', 'status': 'pending', 'seen': '12:10 PM'},
    {'name': 'Kim Navarro', 'first': 'Kim', 'room': 'Room C', 'bed': 'Upper bed', 'isHome': true, 'pres': 'manual', 'status': 'paid', 'seen': '5:50 PM'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Good evening 🌙', style: TextStyle(fontSize: 12, color: AppTheme.muted)),
            Text('Aling Nena', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.text)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_2, color: AppTheme.primary),
            tooltip: 'Pair a Tenant QR',
            onPressed: () => _showPairingQrDialog(context),
          ),
          IconButton(
            icon: Badge(
              label: Text('$pendingReportsCount'),
              backgroundColor: AppTheme.overdue,
              child: const Icon(Icons.notifications_outlined, color: AppTheme.text),
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
            // Warning Banner: Last backup was 9 days ago
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.pendingSoft,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFFE2A4)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('💾', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: RichText(
                      text: const TextSpan(
                        style: TextStyle(color: Color(0xFF7A5200), fontSize: 13, height: 1.4),
                        children: [
                          TextSpan(text: 'Last backup was 9 days ago.\n', style: TextStyle(fontWeight: FontWeight.bold)),
                          TextSpan(text: 'Protect your data in 1 tap. '),
                          TextSpan(text: 'Back up now →', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryDark)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Host Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.line),
                boxShadow: const [
                  BoxShadow(color: Color.fromRGBO(48, 62, 140, 0.08), blurRadius: 18, offset: Offset(0, 4)),
                ],
              ),
              child: Row(
                children: [
                  const Text('🟢', style: TextStyle(fontSize: 24)),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Host is running', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.text)),
                        Text('192.168.1.50:8080 · 5 of 6 tenants paired', style: TextStyle(color: AppTheme.muted, fontSize: 12)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.paidSoft,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text('Online', style: TextStyle(color: AppTheme.paid, fontWeight: FontWeight.w800, fontSize: 12)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Rent Collection Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.line),
                boxShadow: const [
                  BoxShadow(color: Color.fromRGBO(48, 62, 140, 0.08), blurRadius: 18, offset: Offset(0, 4)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('October rent collected', style: TextStyle(color: AppTheme.muted, fontSize: 13)),
                          const SizedBox(height: 2),
                          Text(
                            CurrencyUtils.formatPesos(totalCollectedCentavos),
                            style: const TextStyle(color: AppTheme.text, fontSize: 28, fontWeight: FontWeight.w800),
                          ),
                          Text('of ${CurrencyUtils.formatPesos(totalTargetCentavos)} expected', style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
                        ],
                      ),
                      const Text('💰', style: TextStyle(fontSize: 38)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      value: totalCollectedCentavos / totalTargetCentavos,
                      backgroundColor: const Color(0xFFEEF0F7),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.paid),
                      minHeight: 10,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildChip('✓ 3 Paid', AppTheme.paidSoft, AppTheme.paid),
                      const SizedBox(width: 8),
                      _buildChip('⏳ 2 Pending', AppTheme.pendingSoft, const Color(0xFFB07400)),
                      const SizedBox(width: 8),
                      _buildChip('! 1 Overdue', AppTheme.overdueSoft, AppTheme.overdue),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Needs Attention
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4.0),
              child: Text(
                'NEEDS ATTENTION',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.muted, letterSpacing: 0.5),
              ),
            ),
            const SizedBox(height: 8),

            // Needs Attention 1: Noise report
            _buildAttentionCard(
              emoji: '🔊',
              title: 'Noise report · Room B',
              subtitle: '10 min ago · inside quiet hours',
              badgeText: 'New',
              badgeBg: AppTheme.overdueSoft,
              badgeColor: AppTheme.overdue,
              onTap: widget.onOpenAlerts,
            ),
            const SizedBox(height: 8),

            // Needs Attention 2: Payment to verify
            _buildAttentionCard(
              emoji: '🧾',
              title: '1 payment to verify',
              subtitle: 'Joy · GCash ₱2,500.00',
              badgeText: '›',
              badgeBg: Colors.transparent,
              badgeColor: AppTheme.muted,
              onTap: widget.onOpenBilling,
            ),
            const SizedBox(height: 8),

            // Needs Attention 3: Repair requests
            _buildAttentionCard(
              emoji: '🔧',
              title: '2 open repair requests',
              subtitle: 'Leaking faucet · Broken fan',
              badgeText: '›',
              badgeBg: Colors.transparent,
              badgeColor: AppTheme.muted,
              onTap: () {},
            ),

            const SizedBox(height: 18),

            // Who's Home
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4.0),
              child: Text(
                "WHO'S HOME",
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.muted, letterSpacing: 0.5),
              ),
            ),
            const SizedBox(height: 8),

            // Who's home list
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.line),
                boxShadow: const [
                  BoxShadow(color: Color.fromRGBO(48, 62, 140, 0.08), blurRadius: 18, offset: Offset(0, 4)),
                ],
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.all(12),
                itemCount: _tenants.length,
                separatorBuilder: (_, __) => const Divider(color: AppTheme.line, height: 20),
                itemBuilder: (context, index) {
                  final t = _tenants[index];
                  final isHome = t['pres'] == 'home' || t['pres'] == 'manual';
                  final presLabel = t['pres'] == 'home' 
                      ? '🏠 Home' 
                      : t['pres'] == 'manual' 
                          ? '✋ Home (check-in)' 
                          : '🚶 Away';
                  final status = t['status'] as String;

                  final initials = (t['name'] as String).split(' ').map((x) => x[0]).take(2).join('');

                  return InkWell(
                    onTap: widget.onOpenRooms,
                    child: Row(
                      children: [
                        // Avatar with initials & presence dot
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: AppTheme.avatarColors[index % AppTheme.avatarColors.length],
                              child: Text(
                                initials,
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13),
                              ),
                            ),
                            Positioned(
                              right: -1,
                              bottom: -1,
                              child: Container(
                                width: 14,
                                height: 14,
                                decoration: BoxDecoration(
                                  color: isHome ? AppTheme.home : AppTheme.away,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              RichText(
                                text: TextSpan(
                                  style: const TextStyle(fontSize: 14.5, color: AppTheme.text, fontWeight: FontWeight.w800),
                                  children: [
                                    TextSpan(text: t['first'] as String),
                                    TextSpan(text: ' · ${t['room']}', style: const TextStyle(color: AppTheme.muted, fontWeight: FontWeight.normal, fontSize: 12)),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text('$presLabel · last seen ${t['seen']}', style: const TextStyle(fontSize: 12, color: AppTheme.muted)),
                            ],
                          ),
                        ),
                        _buildStatusChip(status),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChip(String label, Color bg, Color text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: TextStyle(color: text, fontWeight: FontWeight.w800, fontSize: 12)),
    );
  }

  Widget _buildStatusChip(String status) {
    if (status == 'paid') {
      return _buildChip('✓ Paid', AppTheme.paidSoft, AppTheme.paid);
    } else if (status == 'pending') {
      return _buildChip('⏳ Pending', AppTheme.pendingSoft, const Color(0xFFB07400));
    } else {
      return _buildChip('! Overdue', AppTheme.overdueSoft, AppTheme.overdue);
    }
  }

  Widget _buildAttentionCard({
    required String emoji,
    required String title,
    required String subtitle,
    required String badgeText,
    required Color badgeBg,
    required Color badgeColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.line),
          boxShadow: const [
            BoxShadow(color: Color.fromRGBO(48, 62, 140, 0.08), blurRadius: 18, offset: Offset(0, 4)),
          ],
        ),
        child: Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 26)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.text)),
                  Text(subtitle, style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: badgeBg,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                badgeText,
                style: TextStyle(
                  color: badgeColor,
                  fontWeight: FontWeight.w800,
                  fontSize: badgeText == '›' ? 18 : 12,
                ),
              ),
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
        title: const Text('Pair a Tenant (QR)'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                color: AppTheme.bg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.line),
              ),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.qr_code, size: 100, color: AppTheme.primary),
                    SizedBox(height: 8),
                    Text('192.168.1.50:8080', style: TextStyle(fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.bold)),
                    Text('One-time pairing code', style: TextStyle(fontSize: 11, color: AppTheme.muted)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Scan with tenant phone on Santos-Boarding-WiFi to pair automatically.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppTheme.muted),
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
