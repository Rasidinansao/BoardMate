import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/currency_utils.dart';

class RoomManagementScreen extends StatefulWidget {
  const RoomManagementScreen({super.key});

  @override
  State<RoomManagementScreen> createState() => _RoomManagementScreenState();
}

class _RoomManagementScreenState extends State<RoomManagementScreen> {
  final List<Map<String, dynamic>> _rooms = [
    {
      'id': 'rA',
      'name': 'Room A',
      'emoji': '🌻',
      'monthlyRentCentavos': 500000, // ₱5,000.00
      'bedA': {'tenant': 'Maria Santos', 'bed': 'Lower bed', 'status': 'paid', 'due': 5},
      'bedB': {'tenant': 'Joy Dela Cruz', 'bed': 'Upper bed', 'status': 'pending', 'due': 12},
    },
    {
      'id': 'rB',
      'name': 'Room B',
      'emoji': '🌊',
      'monthlyRentCentavos': 500000, // ₱5,000.00
      'bedA': {'tenant': 'Paolo Reyes', 'bed': 'Lower bed', 'status': 'overdue', 'due': 15},
      'bedB': {'tenant': 'Mark Villanueva', 'bed': 'Upper bed', 'status': 'paid', 'due': 1},
    },
    {
      'id': 'rC',
      'name': 'Room C',
      'emoji': '🌙',
      'monthlyRentCentavos': 500000, // ₱5,000.00
      'bedA': {'tenant': 'Angel Bautista', 'bed': 'Lower bed', 'status': 'pending', 'due': 28},
      'bedB': {'tenant': 'Kim Navarro', 'bed': 'Upper bed', 'status': 'paid', 'due': 8},
    },
  ];

  void _editRoomPricing(int index) {
    final room = _rooms[index];
    final controller = TextEditingController(text: ((room['monthlyRentCentavos'] as int) ~/ 100).toString());

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('${room['emoji']} Edit ${room['name']} price'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Monthly room price (₱):', style: TextStyle(fontSize: 12, color: AppTheme.muted)),
            const SizedBox(height: 8),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                prefixText: '₱ ',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Share per tenant = room price ÷ 2. Old bills do not change.',
              style: TextStyle(fontSize: 11, color: AppTheme.primaryDark),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final newRent = int.tryParse(controller.text) ?? 5000;
              setState(() {
                _rooms[index]['monthlyRentCentavos'] = newRent * 100;
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('✓ Price saved. Tenants see the new share from their next due date.')),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            child: const Text('Save', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('Rooms & occupants'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ..._rooms.asMap().entries.map((entry) {
            final index = entry.key;
            final room = entry.value;
            final totalRent = room['monthlyRentCentavos'] as int;
            final rentPerBed = totalRent ~/ 2;

            return Container(
              margin: const EdgeInsets.only(bottom: 16),
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
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: const BoxDecoration(
                      color: AppTheme.bg,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                      border: Border(left: BorderSide(color: AppTheme.primary, width: 6)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${room['emoji']} ${room['name']}',
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.text),
                        ),
                        Row(
                          children: [
                            Text(
                              '${CurrencyUtils.formatPesos(totalRent)} / mo',
                              style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.primaryDark, fontSize: 13),
                            ),
                            const SizedBox(width: 4),
                            IconButton(
                              icon: const Text('✏️', style: TextStyle(fontSize: 16)),
                              onPressed: () => _editRoomPricing(index),
                              tooltip: 'Edit Pricing',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _buildBedRow(room['bedA'], rentPerBed),
                        const SizedBox(height: 10),
                        _buildBedRow(room['bedB'], rentPerBed),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),

          // Info banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.primarySoft,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('💡', style: TextStyle(fontSize: 18)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Share per tenant = room price ÷ people in the room. You can override any share in the tenant profile.',
                    style: TextStyle(color: AppTheme.primaryDark, fontSize: 12.5, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBedRow(Map<String, dynamic> bedData, int rentPerBed) {
    final status = bedData['status'] as String;
    final statusColor = status == 'paid' 
        ? AppTheme.paid 
        : status == 'pending' 
            ? const Color(0xFFB07400) 
            : AppTheme.overdue;
    final statusBg = status == 'paid' 
        ? AppTheme.paidSoft 
        : status == 'pending' 
            ? AppTheme.pendingSoft 
            : AppTheme.overdueSoft;
    final statusLabel = status == 'paid' ? '✓ Paid' : status == 'pending' ? '⏳ Pending' : '! Overdue';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.bg,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppTheme.primarySoft,
            child: Text(
              (bedData['tenant'] as String).substring(0, 1),
              style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.primaryDark, fontSize: 13),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(bedData['tenant'] as String, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppTheme.text)),
                Text('${bedData['bed']} · share ${CurrencyUtils.formatPesos(rentPerBed)} · due every ${bedData['due']}th', style: const TextStyle(fontSize: 11.5, color: AppTheme.muted)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: statusBg,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(statusLabel, style: TextStyle(fontSize: 11, color: statusColor, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}
