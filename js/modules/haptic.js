/**
 * Haptic feedback module for mode switching interactions
 * Provides subtle vibration feedback when chart modes change
 */

/**
 * Check if the device supports the Vibration API
 * @returns {boolean} True if vibration is supported
 */
function isVibrationSupported() {
  return 'vibrate' in navigator;
}

/**
 * Provides haptic feedback for mode switching
 * Uses a short, subtle vibration pulse
 * Gracefully degrades on devices without vibration support
 */
export function vibrateModeSwitch() {
  if (!isVibrationSupported()) {
    return;
  }
  
  try {
    // Short, subtle vibration pattern for mode switching
    // 35ms pulse - enough to be felt but not intrusive
    navigator.vibrate(35);
    console.log('🔄 Haptic feedback: mode switch vibration');
  } catch (error) {
    // Silently fail if vibration API throws an error
    console.debug('Haptic feedback failed:', error);
  }
}

/**
 * Provides haptic feedback for successful interactions
 * Uses an even shorter pulse for confirmation feedback
 */
export function vibrateConfirmation() {
  if (!isVibrationSupported()) {
    return;
  }
  
  try {
    // Very short pulse for confirmation
    navigator.vibrate(30);
    console.log('✓ Haptic feedback: confirmation vibration');
  } catch (error) {
    // Silently fail if vibration API throws an error
    console.debug('Haptic feedback failed:', error);
  }
}
