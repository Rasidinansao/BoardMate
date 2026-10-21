import 'package:flutter/material.dart';

class AppTheme {
  // Step 2 Approved Design Tokens
  static const Color primary = Color(0xFF4F6BED);
  static const Color primarySoft = Color(0xFFE8ECFF);
  static const Color primaryDark = Color(0xFF3550C8);
  static const Color bg = Color(0xFFF5F7FF);
  static const Color card = Colors.white;
  static const Color text = Color(0xFF1F2544);
  static const Color muted = Color(0xFF64748B);
  static const Color line = Color(0xFFE6E9F5);

  static const Color paid = Color(0xFF21A366);
  static const Color paidSoft = Color(0xFFE3F6EC);

  static const Color pending = Color(0xFFE39B12);
  static const Color pendingSoft = Color(0xFFFFF3DA);

  static const Color overdue = Color(0xFFE5484D);
  static const Color overdueSoft = Color(0xFFFDE6E7);

  static const Color home = Color(0xFF21A366);
  static const Color away = Color(0xFF8A90AE);

  static const List<Color> avatarColors = [
    Color(0xFF4F6BED),
    Color(0xFFF08A5D),
    Color(0xFF2BB3A3),
    Color(0xFFB66DFF),
    Color(0xFFE85D9C),
    Color(0xFFE3A008),
  ];

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: bg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primary,
      primary: primary,
      surface: bg,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: text,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
      iconTheme: IconThemeData(color: text),
    ),
  );
}
