import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function FinancingPage() {
  const [vehiclePrice, setVehiclePrice] = useState(45000);
  const [downPayment, setDownPayment] = useState(9000);
  const [interestRate, setInterestRate] = useState(5.5);
  const [loanTerm, setLoanTerm] = useState(48);

  const loanAmount = Math.max(0, vehiclePrice - downPayment);
  const monthlyRate = interestRate / 100 / 12;
  
  // Amortization formula: M = P * [r(1+r)^n] / [(1+r)^n – 1]
  let monthlyPayment = 0;
  if (monthlyRate > 0 && loanTerm > 0 && loanAmount > 0) {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1);
  } else if (loanTerm > 0) {
    monthlyPayment = loanAmount / loanTerm;
  }

  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  function handleApplyPreApproval(e) {
    e.preventDefault();
    toast.success("Financing pre-approval application initialized! Redirecting to application portal...");
  }

  const lenders = [
    { name: "BNP Paribas Personal Finance", rate: "From 4.2% APR", rating: "4.9/5" },
    { name: "Santander Consumer Finance", rate: "From 4.5% APR", rating: "4.8/5" },
    { name: "Barclays Auto Loans", rate: "From 4.9% APR", rating: "4.7/5" },
    { name: "Société Générale Mobility", rate: "From 5.1% APR", rating: "4.8/5" },
  ];

  return (
    <div className="space-y-14 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary-500/10 text-text-accent border border-primary-500/20">
          Tailored Auto Loans
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight font-display">
          Vehicle Financing & <span className="gradient-text">Loan Calculator</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-relaxed">
          Get low-rate auto financing with instant pre-approval through our network of top European banking partners.
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Customize Loan Parameters
          </h2>

          {/* Vehicle Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-text-muted">Vehicle Price</span>
              <span className="text-text-accent font-bold">${vehiclePrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={150000}
              step={1000}
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(Number(e.target.value))}
              className="w-full accent-primary-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>$5,000</span>
              <span>$150,000</span>
            </div>
          </div>

          {/* Down Payment */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-text-muted">Down Payment ({Math.round((downPayment / vehiclePrice) * 100)}%)</span>
              <span className="text-text-accent font-bold">${downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={0}
              max={vehiclePrice * 0.8}
              step={500}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full accent-primary-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>$0</span>
              <span>${(vehiclePrice * 0.8).toLocaleString()}</span>
            </div>
          </div>

          {/* Loan Term Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text-muted">
              Loan Term (Months)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[24, 36, 48, 60, 72].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTerm(term)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition ${
                    loanTerm === term
                      ? "btn-gradient text-white shadow-md"
                      : "bg-background text-text-muted border border-border hover:text-text-primary"
                  }`}
                >
                  {term} Mo
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-text-muted">Est. Interest Rate (APR)</span>
              <span className="text-text-accent font-bold">{interestRate}%</span>
            </div>
            <input
              type="range"
              min={2.0}
              max={15.0}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-primary-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>2.0%</span>
              <span>15.0%</span>
            </div>
          </div>
        </div>

        {/* Calculated Results Box */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="pb-4 border-b border-border">
              <span className="text-xs uppercase font-bold tracking-wider text-text-muted">
                Estimated Payment
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-text-primary mt-1 font-display">
                ${Math.round(monthlyPayment).toLocaleString()}
                <span className="text-base text-text-muted font-normal"> / month</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Loan Principal:</span>
                <span className="font-semibold text-text-primary">${loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Interest ({interestRate}% APR):</span>
                <span className="font-semibold text-text-accent">${Math.round(totalInterest).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-bold">
                <span className="text-text-primary">Total Financing Cost:</span>
                <span className="text-text-primary">${Math.round(totalPayment).toLocaleString()}</span>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-text-muted">
                <span>Principal ({Math.round((loanAmount / (totalPayment || 1)) * 100)}%)</span>
                <span>Interest ({Math.round((totalInterest / (totalPayment || 1)) * 100)}%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-background overflow-hidden flex">
                <div
                  className="bg-primary-500 h-full transition-all duration-300"
                  style={{ width: `${(loanAmount / (totalPayment || 1)) * 100}%` }}
                ></div>
                <div
                  className="bg-text-accent/60 h-full transition-all duration-300"
                  style={{ width: `${(totalInterest / (totalPayment || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleApplyPreApproval} className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl btn-gradient text-white font-semibold text-sm uppercase tracking-wide shadow-md"
            >
              Get Instant Pre-Approval
            </button>
          </form>
        </div>
      </div>

      {/* Lender Partners */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary">Our Lending Partners</h2>
          <p className="text-sm text-text-muted mt-1">We connect you directly to trusted financial institutions with competitive interest rates.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lenders.map((l) => (
            <div key={l.name} className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <h3 className="text-sm font-bold text-text-primary">{l.name}</h3>
              <p className="text-xs font-semibold text-text-accent">{l.rate}</p>
              <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border/50">
                <span>Lender Rating</span>
                <span className="font-bold text-text-primary">{l.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
