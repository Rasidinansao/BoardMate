import 'package:flutter/material.dart';

class AlertsHubScreen extends StatefulWidget {
  const AlertsHubScreen({super.key});

  @override
  State<AlertsHubScreen> createState() => _AlertsHubScreenState();
}

class _AlertsHubScreenState extends State<AlertsHubScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _reports = [
    {
      'id': 'rep-1',
      'tenant': 'Mateo Santos',
      'room': 'Room 101',
      'category': 'Water / Plumbing',
      'description': 'Bathroom faucet is leaking continuously. Need repair.',
      'status': 'Pending',
      'time': '10:30 AM',
      'hasPhoto': true,
    },
    {
      'id': 'rep-2',
      'tenant': 'Carlo Reyes',
      'room': 'Room 102',
      'category': 'Electrical',
      'description': 'Main fluorescent light tube is flickering.',
      'status': 'Pending',
      'time': 'Yesterday',
      'hasPhoto': false,
    },
  ];

  final TextEditingController _broadcastController = TextEditingController(
    text: 'Water supply will be temporarily shut off today from 2 PM to 4 PM for tank maintenance.',
  );
  String _selectedBroadcastRoom = 'All Rooms (6 Tenants)';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  void _resolveReport(int index, String resolution) {
    setState(() {
      _reports[index]['status'] = resolution;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Report marked as $resolution!'),
        backgroundColor: resolution == 'Done' ? const Color(0xFF0D9488) : const Color(0xFF64748B),
      ),
    );
  }

  void _broadcastNotice() {
    final text = _broadcastController.text.trim();
    if (text.isEmpty) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Notice broadcasted to $_selectedBroadcastRoom!'),
        backgroundColor: const Color(0xFF0D9488),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Alert Resolution & Notices'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF0D9488),
          unselectedLabelColor: const Color(0xFF64748B),
          indicatorColor: const Color(0xFF0D9488),
          tabs: const [
            Tab(text: 'Incoming Reports'),
            Tab(text: 'Broadcast Notice'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Tenant Reports
          _buildReportsList(),

          // Tab 2: Broadcast Notice
          _buildBroadcastForm(),
        ],
      ),
    );
  }

  Widget _buildReportsList() {
    final activeReports = _reports.where((r) => r['status'] == 'Pending').toList();

    if (activeReports.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle_outline, size: 64, color: Color(0xFF0D9488)),
            const SizedBox(height: 12),
            const Text('All Clear!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Color(0xFF0F172A))),
            const SizedBox(height: 4),
            const Text('No pending tenant maintenance issues.', style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _reports.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final rep = _reports[index];
        final isPending = rep['status'] == 'Pending';

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      rep['category'] as String,
                      style: const TextStyle(color: Color(0xFFB45309), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Text(rep['time'] as String, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${rep['tenant']} (${rep['room']})',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 4),
              Text(rep['description'] as String, style: const TextStyle(fontSize: 13, color: Color(0xFF334155))),
              const SizedBox(height: 12),
              if (isPending)
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => _resolveReport(index, 'Dismissed'),
                      icon: const Icon(Icons.close, size: 14, color: Color(0xFF64748B)),
                      label: const Text('Dismiss', style: TextStyle(color: Color(0xFF64748B))),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () => _resolveReport(index, 'Done'),
                      icon: const Icon(Icons.check, size: 14, color: Colors.white),
                      label: const Text('Mark Done', style: TextStyle(color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: rep['status'] == 'Done' ? const Color(0xFFECFDF5) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Status: ${rep['status']}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: rep['status'] == 'Done' ? const Color(0xFF047857) : const Color(0xFF64748B),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBroadcastForm() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Send House Notice to Tenants', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('Delivered instantly over local house WiFi.', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _selectedBroadcastRoom,
            decoration: const InputDecoration(
              labelText: 'Target Recipients',
              border: OutlineInputBorder(),
            ),
            items: const [
              DropdownMenuItem(value: 'All Rooms (6 Tenants)', child: Text('All Rooms (6 Tenants)')),
              DropdownMenuItem(value: 'Room 101', child: Text('Room 101')),
              DropdownMenuItem(value: 'Room 102', child: Text('Room 102')),
              DropdownMenuItem(value: 'Room 103', child: Text('Room 103')),
            ],
            onChanged: (val) => setState(() => _selectedBroadcastRoom = val!),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _broadcastController,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Notice Content',
              hintText: 'Enter notice message...',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _broadcastNotice,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.campaign, color: Colors.white),
              label: const Text('Broadcast Notice to Tenants', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
