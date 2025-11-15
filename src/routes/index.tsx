import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute.component';
import RootHandler from '@/components/RootHandler/RootHandler.component';
import LoginPage from '@/pages/Login/Login.page';
import DashboardPage from '@/pages/Dashboard/Dashboard.page';
import OtpPage from '@/pages/Otp/Otp.page';
import InvoicePage from '@/pages/Invoice/Invoice.page';
import ScheduleAppointmentPage from '@/pages/ScheduleAppointment/ScheduleAppointment.page';
import NotFoundPage from '@/pages/NotFound/NotFound.page';
import ExaminationReportPage from '@/pages/ExaminationReport/ExaminationReport.page';
import CashierReportPage from '@/pages/CashierReport/CashierReport.page';
import DebitReportPage from '@/pages/DebitReport/DebitReport.page';
import RequestDebitPage from '@/pages/RequestDebit/RequestDebit.page';
import RequestDebitIndividualPage from '@/pages/RequestDebitIndividual/RequestDebitIndividual.page';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root route - handles authentication logic */}
      <Route path="/" element={<RootHandler />} />

      {/* Login route - accessible only when not authenticated */}
      <Route
        path="/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        }
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/main"
        element={
          <ProtectedRoute requireAuth={true}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/otp"
        element={
          <ProtectedRoute requireAuth={true}>
            <OtpPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoice-report"
        element={
          <ProtectedRoute requireAuth={true}>
            <InvoicePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/schedule-appointment-report"
        element={
          <ProtectedRoute requireAuth={true}>
            <ScheduleAppointmentPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/examination-report"
        element={
          <ProtectedRoute requireAuth={true}>
            <ExaminationReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/card-report"
        element={
          <ProtectedRoute requireAuth={true}>
            <CashierReportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/debit-report"
        element={
          <ProtectedRoute requireAuth={true}>
            <DebitReportPage />
          </ProtectedRoute>
        }
      />

      {/* Add request debit route */}
      <Route
        path="/debit-withdraw-report"
        element={
          <ProtectedRoute requireAuth={true}>
            <RequestDebitPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/return-money-report"
        element={
          <ProtectedRoute requireAuth={true}>
            <RequestDebitIndividualPage />
          </ProtectedRoute>
        }
      />

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};