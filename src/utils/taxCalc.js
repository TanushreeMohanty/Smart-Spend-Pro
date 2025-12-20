import { TAX_LIMITS } from '../constants';

export const calculateTaxData = (transactions, profile) => {
  const now = new Date();
  const fiscalStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fiscalStartDate = new Date(fiscalStartYear, 3, 1);
  
  let totalIncome = 0;
  let investments80C = parseFloat(profile.annualEPF || 0);
  let insurance80D = parseFloat(profile.healthInsurance || 0);
  
  transactions.forEach(t => {
    let d = t.date?.seconds ? new Date(t.date.seconds * 1000) : new Date(t.date);
    if (d >= fiscalStartDate) {
      const amt = parseFloat(t.amount);
      if (t.type === 'income') totalIncome += amt;
      else {
        if (t.category === 'investment' || t.description.toLowerCase().includes('lic')) investments80C += amt;
        if (t.category === 'utilities' && t.description.toLowerCase().includes('insurance')) insurance80D += amt;
      }
    }
  });

  const capped80C = Math.min(investments80C, TAX_LIMITS.SECTION_80C);
  const capped80D = Math.min(insurance80D, TAX_LIMITS.SECTION_80D);
  const taxableIncome = Math.max(0, totalIncome - TAX_LIMITS.STANDARD_DEDUCTION - capped80C - capped80D);

  return { totalIncome, investments80C, capped80C, insurance80D, capped80D, taxableIncome, fiscalYear: `${fiscalStartYear}-${fiscalStartYear+1}` };
};