import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class AlertsHubScreen extends StatefulWidget {
  const AlertsHubScreen({super.key});

  @override
  State<AlertsHubScreen> createState() => _AlertsHubScreenState();
}

class _AlertsHubScreenState extends State<AlertsHubScreen> {
  final List<Map<String, dynamic>> _incomingReports = [
    {
      'id': 'rep-1',
      'emoji': '🔊',
      'title': 'Too noisy · Room B',
      'subtitle': '10 min ago · 10:32 PM · inside quiet hours',
      'sender': '🔒 From Joy (only you can see this)',
      'status': 'New',
    },
    {
      'id': 'rep-2',
      'emoji': '🧹',
      'title': 'Needs cleaning · Kitchen',
      'subtitle': 'Yesterday 4:10 PM · from Mark',
      'sender': 'Mark Villanueva',
      'status': 'Handled',
    },
    {
      'id': 'rep-3',
      'emoji': '⚡',
      'title': 'Brownout on my side',
      'subtitle': 'Oct 18, 2:05 PM · from Angel',
      'sender': 'Angel Bautista',
      'status': 'Handled',
    },
  ];

  final List<Map<String, String>> _managerAlertTiles = [
    {'em': '🤫', 'label': 'Keep it down', 'target': 'Room B', 'msg': 'Hi Room B 🙂 gentle reminder: quiet hours started at 10 PM. Thank you!'},
    {'em': '📦', 'label': 'Parcel for you', 'target': 'Joy', 'msg': 'Hi Joy! You have a parcel 📦 waiting at the front.'},
    {'em': '💧', 'label': 'Water interruption', 'target': 'Everyone', 'msg': 'Scheduled water interruption tomorrow 8 AM–5 PM. Please store water 💧'},
    {'em': '🗑️', 'label': 'Garbage day', 'target': 'Everyone', 'msg': 'Garbage collection tomorrow morning. Please bring your trash down tonight 🗑️'},
    {'em': '💸', 'label': 'Rent reminder', 'target': 'Paolo', 'msg': 'Hi Paolo 🙂 friendly reminder: your rent was due on Oct 15.'},
    {'em': '⚡', 'label': 'Brownout notice', 'target': 'Everyone', 'msg': 'Scheduled brownout on Saturday 9 AM–3 PM ⚡ Please charge your devices.'},
  ];

  void _sendReminder(String emoji, String title, String target, String defaultMsg) {
    final controller = TextEditingController(text: defaultMsg);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(26))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('$emoji $title', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text('Send to: $target', style: const TextStyle(fontSize: 12, color: AppTheme.muted, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              maxLines: 3,
              decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Message (editable)'),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('✓ Sent to $target! Delivered over house WiFi.')),
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                child: const Text('Send Alert', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _dismissReport(int index) {
    setState(() {
      _incomingReports[index]['status'] = 'Dismissed';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Report dismissed')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('Quick Alerts'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section 1: From tenants
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4.0),
              child: Text(
                'FROM TENANTS',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.muted, letterSpacing: 0.5),
              ),
            ),
            const SizedBox(height: 8),

            ..._incomingReports.asMap().entries.map((entry) {
              final idx = entry.key;
              final r = entry.value;
              final isNew = r['status'] == 'New';

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isNew ? AppTheme.overdueSoft : AppTheme.line, width: isNew ? 2 : 1),
                  boxShadow: const [
                    BoxShadow(color: Color.fromRGBO(48, 62, 140, 0.08), blurRadius: 18, offset: Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(r['emoji'] as String, style: const TextStyle(fontSize: 28)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(r['title'] as String, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppTheme.text)),
                              const SizedBox(height: 2),
                              Text(r['subtitle'] as String, style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
                              if (isNew) ...[
                                const SizedBox(height: 4),
                                Text(r['sender'] as String, style: const TextStyle(fontSize: 11, color: AppTheme.text, fontWeight: FontWeight.w600)),
                              ],
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isNew ? AppTheme.overdueSoft : AppTheme.paidSoft,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            r['status'] as String,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: isNew ? AppTheme.overdue : AppTheme.paid,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (isNew) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _sendReminder(
                                '🤫',
                                'Please keep it down',
                                'Room B',
                                'Hi Room B 🙂 gentle reminder: quiet hours started at 10 PM. Thank you!',
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              icon: const Text('🤫', style: TextStyle(fontSize: 14)),
                              label: const Text('Send reminder', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          OutlinedButton(
                            onPressed: () => _dismissReport(idx),
                            style: OutlinedButton.styleFrom(
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Dismiss', style: TextStyle(color: AppTheme.muted, fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              );
            }),

            const SizedBox(height: 18),

            // Section 2: Send to tenants
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4.0),
              child: Text(
                'SEND TO TENANTS',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.muted, letterSpacing: 0.5),
              ),
            ),
            const SizedBox(height: 10),

            // 3-column tiles (Exact as Step 2)
            GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 0.95,
              children: _managerAlertTiles.map((tile) {
                return InkWell(
                  onTap: () => _sendReminder(tile['em']!, tile['label']!, tile['target']!, tile['msg']!),
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.line),
                      boxShadow: const [
                        BoxShadow(color: Color.fromRGBO(48, 62, 140, 0.08), blurRadius: 18, offset: Offset(0, 4)),
                      ],
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(tile['em']!, style: const TextStyle(fontSize: 28)),
                        const SizedBox(height: 6),
                        Text(
                          tile['label']!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.text),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
            const Text(
              'Templates are editable in Settings › Quick Alerts.',
              style: TextStyle(fontSize: 11.5, color: AppTheme.muted),
            ),
          ],
        ),
      ),
    );
  }
}
