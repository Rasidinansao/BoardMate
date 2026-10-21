import 'package:flutter/material.dart';
import '../../../core/utils/currency_utils.dart';

class RoomManagementScreen extends StatefulWidget {
  const RoomManagementScreen({super.key});

  @override
  State<RoomManagementScreen> createState() => _RoomManagementScreenState();
}

class _RoomManagementScreenState extends State<RoomManagementScreen> {
  final List<Map<String, dynamic>> _rooms = [
    {
      'id': 'r101',
      'name': 'Room 101',
      'monthlyRentCentavos': 400000, // ₱4,000.00
      'bedA': {'tenant': 'Juan Dela Cruz', 'status': 'Occupied'},
      'bedB': {'tenant': 'Mateo Santos', 'status': 'Occupied'},
    },
    {
      'id': 'r102',
      'name': 'Room 102',
      'monthlyRentCentavos': 450000, // ₱4,500.00
      'bedA': {'tenant': 'Carlo Reyes', 'status': 'Occupied'},
      'bedB': {'tenant': 'Gabriel Ramos', 'status': 'Occupied'},
    },
    {
      'id': 'r103',
      'name': 'Room 103',
      'monthlyRentCentavos': 380000, // ₱3,800.00
      'bedA': {'tenant': 'Kiko Aquino', 'status': 'Occupied'},
      'bedB': {'tenant': 'Angelo Lopez', 'status': 'Occupied'},
    },
  ];

  void _editRoomPricing(int index) {
    final room = _rooms[index];
    final controller = TextEditingController(text: ((room['monthlyRentCentavos'] as int) ~/ 100).toString());

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Edit ${room['name']} Rent'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Enter Total Room Rent (PHP):', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
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
              'Rent is divided equally among 2 beds automatically.',
              style: TextStyle(fontSize: 11, color: Color(0xFF0D9488)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final newRent = int.tryParse(controller.text) ?? 4000;
              setState(() {
                _rooms[index]['monthlyRentCentavos'] = newRent * 100;
              });
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D9488)),
            child: const Text('Save Pricing', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Rooms & Bed Allocations'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _rooms.length,
        separatorBuilder: (_, __) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final room = _rooms[index];
          final totalRent = room['monthlyRentCentavos'] as int;
          final rentPerBed = totalRent ~/ 2;

          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(
                    color: Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(room['name'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                      Row(
                        children: [
                          Text(
                            '${CurrencyUtils.formatPesos(rentPerBed)} / bed',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0D9488), fontSize: 13),
                          ),
                          const SizedBox(width: 8),
                          IconButton(
                            icon: const Icon(Icons.edit, size: 16, color: Color(0xFF64748B)),
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
                      _buildBedRow('Bed A', room['bedA']['tenant'] as String),
                      const Divider(height: 20),
                      _buildBedRow('Bed B', room['bedB']['tenant'] as String),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildBedRow(String bedName, String tenantName) {
    return Row(
      children: [
        const Icon(Icons.single_bed, color: Color(0xFF0D9488), size: 24),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(bedName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF334155))),
            Text(tenantName, style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A), fontWeight: FontWeight.w600)),
          ],
        ),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFECFDF5),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Text('Occupied', style: TextStyle(fontSize: 11, color: Color(0xFF047857), fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}
