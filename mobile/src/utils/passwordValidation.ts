export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'medium' | 'strong';
  color: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let level: PasswordStrength['level'];
  let color: string;

  if (score <= 1) {
    level = 'weak';
    color = '#ef4444'; // red
  } else if (score === 2) {
    level = 'fair';
    color = '#f97316'; // orange
  } else if (score === 3) {
    level = 'medium';
    color = '#eab308'; // yellow
  } else {
    level = 'strong';
    color = '#10b981'; // green
  }

  return { score, level, color, checks };
}

export function isPasswordValid(password: string): boolean {
  const strength = validatePasswordStrength(password);
  return strength.score >= 3; // At least medium strength
}
