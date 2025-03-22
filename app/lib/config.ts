import { Home, Umbrella, Car, Plane, GraduationCap, Plus, Gem, Shield, Building2, Heart, HeartHandshake, Wallet } from "lucide-react";

export type QuestionType = 'text' | 'number' | 'date' | 'radio' | 'custom';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    errorMessage?: string;
    step?: number;
  };
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  showWhen?: (data: any) => boolean;
  calculateInfo?: (data: any) => string | null;
}

export interface Goal {
  id: string;
  name: string;
  icon: any;
  questions: Question[];
}

export const INFLATION_RATE = 0.06; // 6% annual inflation
export const LTCG_RATE = 0.10; // 10% LTCG

export const calculateFutureCost = (currentCost: number, years: number): number => {
  return currentCost * Math.pow(1 + INFLATION_RATE, years);
};

export const COMMON_QUESTIONS: Question[] = [
  {
    id: 'dateOfBirth',
    type: 'date',
    title: 'When is your birthday?',
    description: 'This helps us personalize your investment journey',
    validation: {
      required: true,
      custom: (value) => {
        const dob = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        return age >= 18;
      },
      errorMessage: 'Age must be between 18 and 100 years',
    }
  }
];

const COMMON_GOAL_QUESTIONS: Question[] = [
  {
    id: 'cost',
    type: 'number',
    title: 'Goal Value',
    description: 'How much does it cost today?',
    placeholder: 'Enter amount in INR',
    validation: {
      required: true,
      min: 0,
      step:10000,
      errorMessage: 'Please enter a valid amount',
    }
  },
  {
    id: 'years',
    type: 'number',
    title: 'Timeline',
    description: 'In how many years do you want to achieve this?',
    placeholder: 'Enter number of years',
    validation: {
      required: true,
      min: 1,
      max: 50,
      step: 1,
      errorMessage: 'Please enter a valid number of years between 1 and 50',
    },
    calculateInfo: (data: any) => {
      if (data.cost && data.years) {
        const futureCost = calculateFutureCost(data.cost, data.years);
        return `In ${data.years} years, accounting for inflation and LTCG:
                Estimated cost: ${futureCost.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`;
      }
      return null;
    }
  },
  {
    id: 'upfrontAmount',
    type: 'number',
    title: 'Upfront Amount',
    description: 'How much money can you give upfront?',
    placeholder: 'Enter amount in INR',
    validation: {
      required: false,
      min: 0,
      step:10000,
      errorMessage: 'Please enter a valid amount',
    }
  }
];

export const GOALS: Goal[] = [
  {
    id: 'ownHome',
    name: 'Own Home',
    icon: Home,
    questions: [
      ...COMMON_GOAL_QUESTIONS,
      {
        id: 'takingLoan',
        type: 'radio',
        title: 'Home Loan',
        description: 'Will you be taking a home loan?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        validation: {
          required: true,
          errorMessage: 'Please select an option',
        }
      },
      {
        id: 'downPaymentPercentage',
        type: 'number',
        title: 'Down Payment',
        description: 'What percentage will be the down payment?',
        placeholder: 'Enter percentage',
        validation: {
          required: true,
          min: 1,
          max: 100,
          errorMessage: 'Down payment percentage must be between 1 and 100',
        },
        showWhen: (data) => data.takingLoan === 'yes',
        calculateInfo: (data: any) => {
          if (data.cost && data.downPaymentPercentage) {
            const downPayment = (data.cost * data.downPaymentPercentage) / 100;
            return `Required down payment: ${downPayment.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`;
          }
          return null;
        }
      },
      {
        id: 'riskLevel',
        type: 'radio',
        title: 'Risk Profile',
        description: 'How risk averse are you?',
        options: [
          { value: 'High', label: 'High' },
          { value: 'Medium', label: 'Medium' },
          { value: 'Low', label: 'Low' }
        ],
        validation: {
          required: true,
          errorMessage: 'Please select your risk level',
        }
      }
    ]
  },
  {
    id: 'retireEasy',
    name: 'Retire Easy',
    icon: Umbrella,
    questions: [
      {
        id: 'monthlyExpenses',
        type: 'number',
        title: 'Monthly Expenses',
        description: 'What are your current monthly expenses?',
        placeholder: 'Enter amount in INR',
        validation: {
          required: true,
          min: 0,
          errorMessage: 'Please enter valid monthly expenses',
        }
      },
      {
        id: 'retirementAge',
        type: 'number',
        title: 'Retirement Age',
        description: 'At what age do you want to retire?',
        placeholder: 'Enter retirement age',
        validation: {
          required: true,
          min: 0,
          max: 100,
          custom: (value) => value > 0,
          errorMessage: 'Please enter a valid retirement age',
        }
      },
      ...COMMON_GOAL_QUESTIONS.filter(q => q.id === 'upfrontAmount')
    ]
  },
  {
    id: 'wedding',
    name: 'Wedding',
    icon: Gem,
    questions: [
      ...COMMON_GOAL_QUESTIONS,
      {
        id: 'guestCount',
        type: 'number',
        title: 'Guest Count',
        description: 'How many guests are you planning to invite?',
        placeholder: 'Enter number of guests',
        validation: {
          required: true,
          min: 1,
          errorMessage: 'Please enter a valid number of guests',
        }
      },
      {
        id: 'includeHoneymoon',
        type: 'radio',
        title: 'Include Honeymoon',
        description: 'Would you like to include honeymoon expenses in your wedding budget?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        validation: {
          required: true,
          errorMessage: 'Please select an option',
        }
      }
    ]
  },
  {
    id: 'emergencyFund',
    name: 'Emergency Fund',
    icon: Shield,
    questions: [
      {
        id: 'monthlyIncome',
        type: 'number',
        title: 'Monthly Income',
        description: 'What is your current monthly income?',
        placeholder: 'Enter amount in INR',
        validation: {
          required: true,
          min: 0,
          step:10000,
          errorMessage: 'Please enter a valid monthly income',
        }
      },
      {
        id: 'desiredCoverageMonths',
        type: 'number',
        title: 'Coverage Period',
        description: 'How many months of expenses do you want to cover?',
        placeholder: 'Enter number of months',
        validation: {
          required: true,
          min: 3,
          max: 24,
          errorMessage: 'Please enter between 3 to 24 months',
        },
        calculateInfo: (data: any) => {
          if (data.monthlyIncome && data.desiredCoverageMonths) {
            const totalAmount = data.monthlyIncome * data.desiredCoverageMonths;
            return `Total emergency fund target: ${totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`;
          }
          return null;
        }
      },
      ...COMMON_GOAL_QUESTIONS.filter(q => q.id === 'upfrontAmount')
    ]
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building2,
    questions: [
      ...COMMON_GOAL_QUESTIONS,
      {
        id: 'businessType',
        type: 'text',
        title: 'Business Type',
        description: 'What type of business are you planning to start?',
        placeholder: 'E.g., Retail, Service, Manufacturing',
        validation: {
          required: true,
          errorMessage: 'Please enter the type of business',
        }
      },
      {
        id: 'employeeCount',
        type: 'number',
        title: 'Initial Employees',
        description: 'How many employees do you plan to hire initially?',
        placeholder: 'Enter number of employees',
        validation: {
          required: true,
          min: 0,
          errorMessage: 'Please enter a valid number of employees',
        }
      }
    ]
  },
  {
    id: 'health',
    name: 'Health',
    icon: Heart,
    questions: [
      ...COMMON_GOAL_QUESTIONS,
      {
        id: 'familySize',
        type: 'number',
        title: 'Family Size',
        description: 'How many family members need to be covered?',
        placeholder: 'Enter number of family members',
        validation: {
          required: true,
          min: 1,
          errorMessage: 'Please enter a valid family size',
        }
      },
      {
        id: 'insuranceCoverage',
        type: 'number',
        title: 'Current Insurance',
        description: 'What is your current health insurance coverage?',
        placeholder: 'Enter amount in INR',
        validation: {
          required: true,
          min: 0,
          errorMessage: 'Please enter your current insurance coverage',
        }
      }
    ]
  },
  {
    id: 'charity',
    name: 'Charity',
    icon: HeartHandshake,
    questions: [
      ...COMMON_GOAL_QUESTIONS,
      {
        id: 'donationType',
        type: 'radio',
        title: 'Donation Type',
        description: 'How would you like to contribute?',
        options: [
          { value: 'one_time', label: 'One-time Donation' },
          { value: 'recurring', label: 'Recurring Donation' }
        ],
        validation: {
          required: true,
          errorMessage: 'Please select a donation type',
        }
      },
      {
        id: 'recurringAmount',
        type: 'number',
        title: 'Monthly Contribution',
        description: 'How much would you like to contribute monthly?',
        placeholder: 'Enter amount in INR',
        validation: {
          required: true,
          min: 0,
          errorMessage: 'Please enter a valid amount',
        },
        showWhen: (data) => data.donationType === 'recurring'
      }
    ]
  },
  {
    id: 'debtRepayment',
    name: 'Debt Repayment',
    icon: Wallet,
    questions: [
      ...COMMON_GOAL_QUESTIONS,
      {
        id: 'debtType',
        type: 'radio',
        title: 'Type of Debt',
        description: 'What type of debt do you want to repay?',
        options: [
          { value: 'credit_card', label: 'Credit Card' },
          { value: 'personal_loan', label: 'Personal Loan' },
          { value: 'student_loan', label: 'Student Loan' },
          { value: 'other', label: 'Other' }
        ],
        validation: {
          required: true,
          errorMessage: 'Please select the type of debt',
        }
      },
      {
        id: 'interestRate',
        type: 'number',
        title: 'Interest Rate',
        description: 'What is the annual interest rate on your debt?',
        placeholder: 'Enter percentage',
        validation: {
          required: true,
          min: 0,
          max: 100,
          errorMessage: 'Please enter a valid interest rate between 0 and 100',
        }
      },
      {
        id: 'minimumPayment',
        type: 'number',
        title: 'Minimum Payment',
        description: 'What is your current minimum monthly payment?',
        placeholder: 'Enter amount in INR',
        validation: {
          required: true,
          min: 0,
          errorMessage: 'Please enter a valid minimum payment amount',
        }
      }
    ]
  },
  {
    id: 'buyCar',
    name: 'Buy Car',
    icon: Car,
    questions: [...COMMON_GOAL_QUESTIONS]
  },
  {
    id: 'vacation',
    name: 'Vacation',
    icon: Plane,
    questions: [...COMMON_GOAL_QUESTIONS]
  },
  {
    id: 'educateChild',
    name: 'Educate Child',
    icon: GraduationCap,
    questions: [...COMMON_GOAL_QUESTIONS]
  },
  {
    id: 'customGoal',
    name: 'Create Own',
    icon: Plus,
    questions: [
      {
        id: 'name',
        type: 'text',
        title: 'Goal Name',
        description: "What's the goal name?",
        placeholder: 'Enter goal name',
        validation: {
          required: true,
          errorMessage: 'Please enter a goal name',
        }
      },
      ...COMMON_GOAL_QUESTIONS
    ]
  }
]; 