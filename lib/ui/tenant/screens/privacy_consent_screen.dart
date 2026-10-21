import 'package:flutter/material.dart';

class PrivacyConsentScreen extends StatelessWidget {
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const PrivacyConsentScreen({
    super.key,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Icon(Icons.shield_outlined, color: Color(0xFF0D9488), size: 30),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Data Privacy Notice',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 6),
              const Text(
                'Republic Act No. 10173 (Philippine Data Privacy Act)',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0D9488)),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: const SingleChildScrollView(
                    child: Text(
                      'BoardMate operates entirely within your boarding house local WiFi network.\n\n'
                      '1. WiFi Presence Tracking:\n'
                      'To assist house security and emergency roll calls, this app detects when your phone connects to the house router ("Santos-Boarding-WiFi"). No GPS coordinates or external location data are ever transmitted to the internet.\n\n'
                      '2. Billing & Payment Proofs:\n'
                      'Payment transaction references (GCash, Maya, Cash) and maintenance reports are stored only on the landlady\'s host phone inside the house.\n\n'
                      '3. Right to Withdraw:\n'
                      'You may revoke pairing at any time. By tapping "I Agree", you consent to local network presence detection pursuant to RA 10173.',
                      style: TextStyle(fontSize: 13, height: 1.5, color: Color(0xFF334155)),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onDecline,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Decline', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: onAccept,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0D9488),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('I Agree & Continue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
