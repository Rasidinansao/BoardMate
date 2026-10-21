import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Package, 
  Code2, 
  ShieldAlert, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const CompanionGuide: React.FC = () => {
  const [openSection, setOpenSection] = useState<'apk' | 'q1' | 'q2' | 'q3' | 'flutter' | null>('apk');

  const toggle = (section: 'apk' | 'q1' | 'q2' | 'q3' | 'flutter') => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="bg-white border border-[#E6E9F5] rounded-[24px] p-6 shadow-[0_4px_18px_rgba(48,62,140,0.08)] space-y-5 text-[#1F2544]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E6E9F5] pb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E8ECFF] text-[#4F6BED] flex items-center justify-center text-xl shrink-0 font-bold">
          🛠️
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-[#1F2544]">Senior Flutter Architect Guide</h2>
          <p className="text-xs text-[#6B7194]">Answers to your questions, light theme alignment & APK roadmap</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* NEW SECTION: ARE WE READY TO RELEASE THE APK NOW? */}
        <div className="border border-[#E6E9F5] rounded-2xl overflow-hidden bg-[#F5F7FF]">
          <button
            onClick={() => toggle('apk')}
            className="w-full p-4 flex justify-between items-center text-left hover:bg-[#E8ECFF]/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📦</span>
              <div>
                <h3 className="font-extrabold text-[#1F2544] text-sm">
                  Are we ready to release the APK now?
                </h3>
                <p className="text-[11px] text-[#6B7194]">
                  Senior developer honest appraisal of the current project milestone
                </p>
              </div>
            </div>
            {openSection === 'apk' ? <ChevronUp className="w-4 h-4 text-[#6B7194]" /> : <ChevronDown className="w-4 h-4 text-[#6B7194]" />}
          </button>

          {openSection === 'apk' && (
            <div className="p-4 pt-1 border-t border-[#E6E9F5] text-xs text-[#1F2544] space-y-3 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[#FFF3DA] border border-[#FFE2A4] text-[#7A5200] space-y-1">
                <span className="font-extrabold text-xs block text-[#B07400]">
                  ⚠️ Honest Engineer Advice: Not quite yet — here is why:
                </span>
                <p className="text-[11.5px] leading-relaxed">
                  Right now, we are in <strong>Step 2 (Interactive UI/UX Mockup & Feature Validation)</strong>. This interactive prototype allows us to test and verify every button, screen, alert dismissal, and QR pairing flow directly in the browser before writing hundreds of lines of native Android / Flutter code.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E6E9F5] space-y-2">
                <span className="font-bold text-[#4F6BED] block">The 3-Step Milestone Workflow from your prompt:</span>
                <div className="space-y-1.5 text-[11px] text-[#6B7194]">
                  <p>• <strong>Step 1: Plan</strong> (Done & Approved) — Data model, local Shelf + SQLite architecture, 6-tenant scope.</p>
                  <p>• <strong>Step 2: Mockups</strong> (Current Milestone) — Interactive 390px mobile screens, light-theme parity, alert dismissals, pairing camera UX.</p>
                  <p>• <strong>Step 3: Build & APK Compilation</strong> (Next Milestone) — Creating the Flutter project (<code className="text-[#1F2544] font-mono">pubspec.yaml</code>, Drift SQLite database, Shelf HTTP daemon, Android foreground service) and compiling via <code className="text-[#1F2544] font-mono">flutter build apk --release</code>.</p>
                </div>
              </div>

              <p className="text-[11px] text-[#6B7194]">
                Once you approve this corrected light-theme prototype and confirm that the alerts & pairing flows meet your expectations, you can say <strong>"Approved, proceed to Step 3 Flutter Build"</strong>, and we will begin Milestone 1 of the Flutter engine!
              </p>
            </div>
          )}
        </div>

        {/* QUESTION 1: INCOMING ALERTS DISMISS / MARK AS DONE */}
        <div className="border border-[#E6E9F5] rounded-2xl overflow-hidden bg-[#F5F7FF]">
          <button
            onClick={() => toggle('q1')}
            className="w-full p-4 flex justify-between items-center text-left hover:bg-[#E8ECFF]/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📢</span>
              <div>
                <h3 className="font-extrabold text-[#1F2544] text-sm">
                  1. Dismissing & Marking Incoming Tenant Reports as Done
                </h3>
                <p className="text-[11px] text-[#6B7194]">
                  Interactive resolution buttons on tenant reports
                </p>
              </div>
            </div>
            {openSection === 'q1' ? <ChevronUp className="w-4 h-4 text-[#6B7194]" /> : <ChevronDown className="w-4 h-4 text-[#6B7194]" />}
          </button>

          {openSection === 'q1' && (
            <div className="p-4 pt-1 border-t border-[#E6E9F5] text-xs text-[#1F2544] space-y-3 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#E3F6EC] border border-[#C3EED7] text-[#11683F]">
                <span className="font-extrabold block text-[#21A366]">✓ Active Clickable Actions in Alerts Tab:</span>
                <ul className="list-disc list-inside mt-1 space-y-1 text-[#1F2544]">
                  <li><strong>Mark as Done:</strong> Sets status to <code className="text-[#21A366] font-bold">done</code>, records note, and decrements badge counter.</li>
                  <li><strong>Dismiss:</strong> Archives report with status <code className="text-[#6B7194] font-bold">dismissed</code>.</li>
                  <li><strong>Reply to Room:</strong> Opens dispatcher pre-filled with the reporter's room.</li>
                  <li><strong>Reopen:</strong> Filter by "Done" or "Dismissed" to reopen if needed.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* QUESTION 2: QUICK ALERTS */}
        <div className="border border-[#E6E9F5] rounded-2xl overflow-hidden bg-[#F5F7FF]">
          <button
            onClick={() => toggle('q2')}
            className="w-full p-4 flex justify-between items-center text-left hover:bg-[#E8ECFF]/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🎯</span>
              <div>
                <h3 className="font-extrabold text-[#1F2544] text-sm">
                  2. Quick Alerts: Room-Specific vs. Entire House Broadcasts
                </h3>
                <p className="text-[11px] text-[#6B7194]">
                  Audience targeting and 16 editable boarding situations
                </p>
              </div>
            </div>
            {openSection === 'q2' ? <ChevronUp className="w-4 h-4 text-[#6B7194]" /> : <ChevronDown className="w-4 h-4 text-[#6B7194]" />}
          </button>

          {openSection === 'q2' && (
            <div className="p-4 pt-1 border-t border-[#E6E9F5] text-xs text-[#1F2544] space-y-2 leading-relaxed">
              <p>
                <strong>Entire House:</strong> Used for general advisories (Meralco brownouts, Maynilad water schedules, trash collection, gate padlocking at 11 PM).
              </p>
              <p>
                <strong>Specific Room:</strong> Targets Room A, B, or C specifically (noise past 10 PM, lights left on, or replying to a tenant report).
              </p>
              <p className="text-[#6B7194]">
                All 16 emojis provide sensible default Philippine boarding house notices, and the title and message text are 100% editable before sending.
              </p>
            </div>
          )}
        </div>

        {/* QUESTION 3: PAIRING CAMERA */}
        <div className="border border-[#E6E9F5] rounded-2xl overflow-hidden bg-[#F5F7FF]">
          <button
            onClick={() => toggle('q3')}
            className="w-full p-4 flex justify-between items-center text-left hover:bg-[#E8ECFF]/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📷</span>
              <div>
                <h3 className="font-extrabold text-[#1F2544] text-sm">
                  3. Pairing: In-App Camera Scanner vs Plain Camera
                </h3>
                <p className="text-[11px] text-[#6B7194]">
                  How the tenant phone connects to the host server
                </p>
              </div>
            </div>
            {openSection === 'q3' ? <ChevronUp className="w-4 h-4 text-[#6B7194]" /> : <ChevronDown className="w-4 h-4 text-[#6B7194]" />}
          </button>

          {openSection === 'q3' && (
            <div className="p-4 pt-1 border-t border-[#E6E9F5] text-xs text-[#1F2544] space-y-2 leading-relaxed">
              <p>
                <strong>In-App Camera Viewfinder:</strong> In Flutter, the tenant app activates CameraX directly via <code className="text-[#4F6BED] font-mono">mobile_scanner</code> inside the app. It scans the QR in under 0.5s without switching apps.
              </p>
              <p>
                <strong>Manual IP Fallback:</strong> If a tenant's phone camera is broken or permission is denied, they can manually enter the host IP and token (<code className="text-[#4F6BED] font-mono">192.168.1.50:8080#BM-T9821</code>).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
