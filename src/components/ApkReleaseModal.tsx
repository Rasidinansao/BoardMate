import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Layers, 
  QrCode,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ApkReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedAppUrl: string;
}

export function ApkReleaseModal({ isOpen, onClose, sharedAppUrl }: ApkReleaseModalProps) {
  const [activeTab, setActiveTab] = useState<'instant' | 'github' | 'local'>('instant');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const cliCommand = `flutter build apk --release`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] max-w-2xl w-full shadow-2xl border border-[#E2E8F0] overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#4F6BED] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
              📦
            </div>
            <div>
              <h2 className="text-xl font-bold">Release & Install BoardMate APK</h2>
              <p className="text-indigo-100 text-xs mt-0.5">
                Android 8.0+ (Oreo, Pie, 10, 11, 12, 13, 14, 15) • Standalone Mobile App
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-5 bg-black/15 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('instant')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'instant' ? 'bg-white text-[#4F6BED] shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>1. Direct Phone Install</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'github' ? 'bg-white text-[#4F6BED] shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Cloud APK Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('local')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'local' ? 'bg-white text-[#4F6BED] shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>3. Local CLI Build</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Instant PWA Direct Install */}
        {activeTab === 'instant' && (
          <div className="p-6 space-y-4">
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 flex items-start gap-3">
              <div className="text-xl">⚡</div>
              <div>
                <h4 className="font-bold text-[#065F46] text-sm">Instant Android Standalone App (No PC Required)</h4>
                <p className="text-xs text-[#047857] mt-1 leading-relaxed">
                  BoardMate is pre-configured with a Progressive Web App (PWA) manifest and offline service worker. You and your 6 tenants can install it directly onto any Android phone in 10 seconds!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-xs uppercase text-[#64748B] tracking-wider">How to Install on Your Android Phone:</h5>
              
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-6 h-6 rounded-full bg-[#4F6BED] text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div className="text-xs text-[#334155] leading-relaxed flex-1">
                  Click the <strong>"Share"</strong> button at the top right of AI Studio to activate your public link, then open it in Chrome on your phone:
                  <div className="mt-1.5 p-2 bg-white rounded-lg border border-[#CBD5E1] font-mono text-[11px] text-[#4F6BED] flex items-center justify-between">
                    <span className="truncate">{sharedAppUrl}</span>
                    <button 
                      onClick={() => copyToClipboard(sharedAppUrl, 'url')}
                      className="ml-2 text-[#64748B] hover:text-[#4F6BED]"
                      title="Copy URL"
                    >
                      {copiedText === 'url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-md mt-2 border border-amber-200">
                    ⚠️ <strong>Seeing "Page not found"?</strong> Make sure to click the <strong>Share</strong> button in the top-right toolbar of AI Studio first so Google publishes the link to the web.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-6 h-6 rounded-full bg-[#4F6BED] text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div className="text-xs text-[#334155] leading-relaxed">
                  Tap the Chrome menu (the <strong>3 dots ⋮</strong> in the top-right corner).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-6 h-6 rounded-full bg-[#4F6BED] text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div className="text-xs text-[#334155] leading-relaxed">
                  Tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-6 h-6 rounded-full bg-[#4F6BED] text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
                <div className="text-xs text-[#334155] leading-relaxed">
                  <strong>Done!</strong> BoardMate will now appear on your home screen with the official house icon, full-screen without address bars, and instant local response.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GitHub Actions Cloud APK Builder */}
        {activeTab === 'github' && (
          <div className="p-6 space-y-4">
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex items-start gap-3">
              <div className="text-xl">☁️</div>
              <div>
                <h4 className="font-bold text-[#1E40AF] text-sm">Automated Cloud Dual-APK Compiler (.github/workflows/build-apk.yml)</h4>
                <p className="text-xs text-[#1D4ED8] mt-1 leading-relaxed">
                  We have configured the CI workflow to automatically build and package <strong>two distinct APKs</strong> in one run:
                </p>
                <div className="mt-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                    <span>BoardMate-Manager.apk</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-normal">Host Server + Financials</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#0F172A]">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>BoardMate-Tenant.apk</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-normal">Client + QR Camera Scan</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-bold text-xs uppercase text-[#64748B] tracking-wider">How to get both APKs in 2 minutes:</h5>
              <ol className="space-y-2 text-xs text-[#334155] list-decimal list-inside leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <li>Push this repository to a free GitHub repository (private or public).</li>
                <li>Go to the <strong>"Actions"</strong> tab on GitHub.</li>
                <li>Click <strong>"Build BoardMate APKs"</strong> &gt; <strong>"Run workflow"</strong>.</li>
                <li>GitHub compiles both flavors and outputs <strong>boardmate-release-apks.zip</strong> containing both <code>BoardMate-Manager.apk</code> and <code>BoardMate-Tenant.apk</code>!</li>
                <li>Install <code>BoardMate-Manager.apk</code> on your phone, and send <code>BoardMate-Tenant.apk</code> to your 6 tenants.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: Local CLI Build */}
        {activeTab === 'local' && (
          <div className="p-6 space-y-4">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4">
              <h4 className="font-bold text-[#0F172A] text-sm mb-2">Build Both APKs with Flutter SDK</h4>
              <p className="text-xs text-[#64748B] mb-3">
                Run these two commands from your project root to generate both role-specific APKs:
              </p>
              
              <div className="space-y-2.5">
                <div>
                  <div className="text-[11px] font-bold text-[#4F6BED] mb-1">1. Build Manager APK:</div>
                  <div className="bg-[#0F172A] text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] flex items-center justify-between">
                    <span className="truncate">flutter build apk --flavor manager -t lib/main_manager.dart --release</span>
                    <button
                      onClick={() => copyToClipboard('flutter build apk --flavor manager -t lib/main_manager.dart --release', 'cli-m')}
                      className="ml-2 text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedText === 'cli-m' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-indigo-600 mb-1">2. Build Tenant APK:</div>
                  <div className="bg-[#0F172A] text-indigo-300 p-2.5 rounded-xl font-mono text-[11px] flex items-center justify-between">
                    <span className="truncate">flutter build apk --flavor tenant -t lib/main_tenant.dart --release</span>
                    <button
                      onClick={() => copyToClipboard('flutter build apk --flavor tenant -t lib/main_tenant.dart --release', 'cli-t')}
                      className="ml-2 text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedText === 'cli-t' ? <Check className="w-3.5 h-3.5 text-indigo-300" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#64748B] mt-3 space-y-1">
                <div>Output 1: <code>build/app/outputs/flutter-apk/app-manager-release.apk</code></div>
                <div>Output 2: <code>build/app/outputs/flutter-apk/app-tenant-release.apk</code></div>
              </div>
            </div>

            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3 text-xs text-[#92400E]">
              <strong>Hardware Targets:</strong> Minimum SDK 26 (Android 8.0 Oreo), Target SDK 34 (Android 14/15), 64-bit ARM (arm64-v8a) & 32-bit (armeabi-v7a).
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] p-4 px-6 flex items-center justify-between">
          <span className="text-xs text-[#64748B]">BoardMate v1.0.0 Stable</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#4F6BED] hover:bg-[#3550C8] text-white font-bold text-xs shadow-xs transition-colors"
          >
            Got It! Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
