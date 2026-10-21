import 'package:flutter/material.dart';
import '../../../core/utils/currency_utils.dart';

class TenantHomeScreen extends StatefulWidget {
  final VoidCallback onPayRent;
  final VoidCallback onReportProblem;
  final VoidCallback onEmergency;
  final VoidCallback onOpenRoom;

  const TenantHomeScreen({
    super.key,
    required this.onPayRent,
    required this.onReportProblem,
    required this.onEmergency,
    required this.onOpenRoom,
  });

  @override
  State<TenantHomeScreen> createState() => _TenantHomeScreenState();
}

class _TenantHomeScreenState extends State<TenantHomeScreen> {
  final int rentDueCentavos = 200000; // ₱2,000.00
  bool isPaid = false;
  String paymentRef = '';

  void _showPayModal() {
    final controller = TextEditingController();
    String method = 'GCash';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
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
              const Text('Submit Rent Payment', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text('Amount Due: ${CurrencyUtils.formatPesos(rentDueCentavos)}', style: const TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: method,
                decoration: const InputDecoration(labelText: 'Payment Channel', border: OutlineInputBorder()),
                items: const [
                  DropdownMenuItem(value: 'GCash', child: Text('GCash')),
                  DropdownMenuItem(value: 'Maya', child: Text('Maya')),
                  DropdownMenuItem(value: 'Cash', child: Text('Cash to Landlady')),
                  DropdownMenuItem(value: 'Bank Transfer', child: Text('Bank Transfer (BDO/BPI)')),
                ],
                onChanged: (val) => setModalState(() => method = val!),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: controller,
                decoration: InputDecoration(
                  labelText: method == 'Cash' ? 'Notes / Handed to' : 'Reference / Transaction No.',
                  hintText: method == 'Cash' ? 'Handed to Nanay Santos' : 'e.g. 100293847291',
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    final ref = controller.text.trim();
                    if (ref.isEmpty) return;
                    setState(() {
                      isPaid = true;
                      paymentRef = '$method Ref: $ref';
                    });
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Payment submitted via $method! Landlady will verify.')),
                    );
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D9488)),
                  child: const Text('Submit Payment Proof', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('BoardMate Tenant', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            Text('Santos Boarding House • Room 101 Bed A', style: TextStyle(fontSize: 11, color: Color(0xFF0D9488))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.emergency, color: Color(0xFFE11D48)),
            tooltip: 'Emergency Alert',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Emergency signal sent to Landlady host device!'),
                  backgroundColor: Color(0xFFE11D48),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // WiFi Presence Status Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.wifi, color: Color(0xFF047857), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Connected to Santos-Boarding-WiFi', style: TextStyle(color: Color(0xFF065F46), fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('Presence status: Home • Host IP: 192.168.1.100', style: TextStyle(color: Color(0xFF047857), fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Rent Card
            Container(
              padding: const EdgeInsets.all(18),
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Monthly Rent Due', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isPaid ? const Color(0xFF10B981) : Colors.amber.shade600,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          isPaid ? 'Payment Submitted' : 'Due: End of Month',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    CurrencyUtils.formatPesos(rentDueCentavos),
                    style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  if (isPaid) ...[
                    const SizedBox(height: 6),
                    Text(paymentRef, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: isPaid ? null : _showPayModal,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF0D9488),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: Icon(isPaid ? Icons.check_circle : Icons.payment, size: 18),
                      label: Text(isPaid ? 'Payment Under Review' : 'Pay via GCash / Maya / Cash', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Roommate Status
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Roommate Status (Room 101)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  SizedBox(height: 12),
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Color(0xFFF1F5F9),
                        child: Text('🚶', style: TextStyle(fontSize: 16)),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Mateo Santos', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Text('Bed 101-B', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text('Away', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), fontSize: 12)),
                          Text('Last seen: 2 hrs ago', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Actions Grid
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: widget.onReportProblem,
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.build_circle_outlined, color: Color(0xFF0D9488), size: 28),
                          SizedBox(height: 8),
                          Text('Report Issue', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text('Faucet, lights, repairs', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Notice: Water supply maintenance today 2-4 PM.')),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.notifications_active_outlined, color: Color(0xFF0D9488), size: 28),
                          SizedBox(height: 8),
                          Text('House Notices', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text('1 active notice', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
