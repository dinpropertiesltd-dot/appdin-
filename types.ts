
export type UserRole = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  cnic: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
  password?: string;
  isOnline?: boolean;
}

export interface Transaction {
  seq: number;
  transid: number;
  line_id: number;
  shortname: string;
  duedate: string;
  receivable: number | null;
  u_intno: number;
  u_intname: string;
  transtype: string;
  itemcode: string;
  plottype: string;
  currency: string;
  description: string;
  doctotal: number;
  status: string;
  balance: number;
  balduedeb?: number;
  paysrc: number | null;
  amount_paid?: number;
  receipt_date?: string;
  mode?: string;
  surcharge?: number;
  instrument_no?: string;
}

export interface PropertyFile {
  fileNo: string;
  currencyNo: string;
  plotSize: string;
  plotValue: number;
  balance: number;
  receivable: number;
  totalReceivable: number;
  paymentReceived: number;
  surcharge: number;
  overdue: number;
  ownerName: string;
  ownerCNIC: string;
  fatherName: string;
  cellNo: string;
  regDate: string;
  address: string;
  plotNo: string;
  block: string;
  park: string;
  corner: string;
  mainBoulevard: string;
  transactions: Transaction[];
  uploadedStatementUrl?: string;
  uploadedStatementName?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'Public' | 'Policy' | 'Alert';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  fileId?: string;
  type?: 'Direct' | 'Broadcast';
}

export interface PortalNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO';
  category: 'PAYMENT' | 'SECURITY' | 'SYSTEM';
  date: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    amount?: number;
    fileNo?: string;
    dueDate?: string;
  };
}
