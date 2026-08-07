// Dialer integration stub (Phase 6).
//
// TODO: integration — pick vendor (JustCall / RingCentral / Five9),
// confirm Jordan SIP trunking, then wire click-to-call + recording.

export type DialerVendor = 'justcall' | 'ringcentral' | 'five9' | 'none';

export type CallResult = {
  call_id: string;
  recording_url?: string;
  duration_seconds: number;
  disposition: 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'failed';
};

export async function placeCall(_phone: string): Promise<CallResult> {
  // TODO: integration — dispatch to the configured vendor.
  return {
    call_id: `stub-${Date.now()}`,
    duration_seconds: 0,
    disposition: 'failed'
  };
}

export async function fetchRecording(_call_id: string): Promise<string | null> {
  // TODO: integration — return the recording URL from the vendor.
  return null;
}
