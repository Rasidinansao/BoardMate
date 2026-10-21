class CurrencyUtils {
  /// Formats integer centavos to Philippine Peso format (e.g. 200000 -> ₱2,000.00)
  static String formatPesos(int centavos, {bool includeDecimals = true}) {
    final double amount = centavos / 100.0;
    final String fixed = amount.toStringAsFixed(2);
    final parts = fixed.split('.');
    final integerPart = parts[0].replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
    if (!includeDecimals || parts[1] == '00') {
      return '₱$integerPart';
    }
    return '₱$integerPart.${parts[1]}';
  }
}
