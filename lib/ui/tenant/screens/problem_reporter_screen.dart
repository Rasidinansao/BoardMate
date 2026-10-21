import 'package:flutter/material.dart';

class ProblemReporterScreen extends StatefulWidget {
  final Function(Map<String, dynamic>) onSubmitReport;

  const ProblemReporterScreen({super.key, required this.onSubmitReport});

  @override
  State<ProblemReporterScreen> createState() => _ProblemReporterScreenState();
}

class _ProblemReporterScreenState extends State<ProblemReporterScreen> {
  String _selectedCategory = 'Water / Plumbing';
  final TextEditingController _descController = TextEditingController();
  bool _hasAttachedPhoto = false;

  void _submit() {
    final text = _descController.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please describe the problem.')),
      );
      return;
    }

    final data = {
      'category': _selectedCategory,
      'description': text,
      'hasPhoto': _hasAttachedPhoto,
      'timestamp': DateTime.now().toIso8601String(),
    };

    widget.onSubmitReport(data);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Problem report dispatched to Landlady over house WiFi!'),
        backgroundColor: Color(0xFF0D9488),
      ),
    );

    Navigator.maybePop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Report a Problem'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Maintenance or Repair Request',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 4),
            const Text(
              'Sent directly to Nanay Santos\'s dashboard over house WiFi.',
              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 20),

            // Category
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(
                labelText: 'Problem Category',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: 'Water / Plumbing', child: Text('💧 Water / Plumbing')),
                DropdownMenuItem(value: 'Electrical / Lights', child: Text('⚡ Electrical / Lights')),
                DropdownMenuItem(value: 'Bed & Furniture', child: Text('🛏️ Bed & Furniture')),
                DropdownMenuItem(value: 'Cleanliness / Trash', child: Text('🧹 Cleanliness / Trash')),
                DropdownMenuItem(value: 'Noise / Security', child: Text('🚨 Noise / Security')),
              ],
              onChanged: (val) => setState(() => _selectedCategory = val!),
            ),

            const SizedBox(height: 16),

            // Description
            TextField(
              controller: _descController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Describe the issue in detail',
                hintText: 'e.g. Bathroom sink pipe is dripping water onto the floor...',
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 16),

            // Photo attachment simulation
            InkWell(
              onTap: () {
                setState(() => _hasAttachedPhoto = !_hasAttachedPhoto);
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _hasAttachedPhoto ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _hasAttachedPhoto ? const Color(0xFF10B981) : const Color(0xFFCBD5E1)),
                ),
                child: Row(
                  children: [
                    Icon(
                      _hasAttachedPhoto ? Icons.check_circle : Icons.camera_alt_outlined,
                      color: _hasAttachedPhoto ? const Color(0xFF047857) : const Color(0xFF64748B),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _hasAttachedPhoto ? 'Photo Attached (leak_proof.jpg)' : 'Attach Photo Proof (Camera)',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: _hasAttachedPhoto ? const Color(0xFF065F46) : const Color(0xFF334155),
                            ),
                          ),
                          Text(
                            _hasAttachedPhoto ? 'Tap to remove attachment' : 'Tap to take picture or select from gallery',
                            style: TextStyle(fontSize: 11, color: _hasAttachedPhoto ? const Color(0xFF047857) : const Color(0xFF94A3B8)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D9488),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.send, color: Colors.white),
                label: const Text('Send Report to Landlady', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
