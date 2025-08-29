"use client"

import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from "@react-pdf/renderer";

Font.register({
  family: "Tiro Bangla",
  src: "/fonts/TiroBangla-Regular.ttf",
});

// --- Styling for the PDF Document ---
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Tiro Bangla",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: "48%",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  insightCard: {
    backgroundColor: "#ecfdf5",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1fae5",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 11,
    color: "#065f46",
  },
  goalCard: {
    backgroundColor: "#fefce8",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fde047",
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 10,
    color: "#78716c",
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 10,
    color: "#9ca3af",
  },
});


// --- PDF Document Component ---
const PDFReport = ({ monthName, monthlyStats, insights, goalAchievements }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>মাসিক রিপোর্ট</Text>
        <Text style={styles.subtitle}>{monthName}</Text>
      </View>

      {/* Monthly Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>মাসিক সারসংক্ষেপ</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>মোট দিন</Text>
            <Text style={styles.statValue}>{monthlyStats.totalDays}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>কুরআন অধ্যয়ন</Text>
            <Text style={styles.statValue}>{Math.round(monthlyStats.quranStudy / 60)} ঘণ্টা</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>নামাজ (জামাতে)</Text>
            <Text style={styles.statValue}>{monthlyStats.prayersInCongregation}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>মোট ব্যায়াম</Text>
            <Text style={styles.statValue}>{monthlyStats.totalExercise}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>কাজের ঘণ্টা</Text>
            <Text style={styles.statValue}>{Math.round(monthlyStats.totalWorkHours / 60)} ঘণ্টা</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>দক্ষতা উন্নয়ন</Text>
            <Text style={styles.statValue}>{Math.round(monthlyStats.skillDevelopment / 60)} ঘণ্টা</Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>মাসিক অন্তর্দৃষ্টি</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <Text style={styles.insightText}>{insight.message}</Text>
          </View>
        ))}
      </View>

      {/* Goal Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>লক্ষ্য অর্জন</Text>
        {goalAchievements.slice(0, 4).map((goal, index) => (
          <View key={index} style={styles.goalCard}>
            <Text style={styles.goalTitle}>{goal.category}</Text>
            <Text style={styles.goalProgress}>
              অর্জিত: {goal.achieved} / লক্ষ্য: {goal.target_value} ({goal.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          রিপোর্ট তৈরি হয়েছে:{" "}
          {new Date().toLocaleDateString("bn-BD", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.footerText}>জীবন ট্র্যাকিং অ্যাপ্লিকেশন</Text>
      </View>
    </Page>
  </Document>
);

// --- PDF Download Link Component ---
// This component renders the download button and handles the PDF generation.
export function PDFReportGenerator({ monthName, monthlyStats, insights, goalAchievements }) {
    
  // Replaced custom Button with a standard button and inline styles
  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    color: '#374151',
    textDecoration: 'none',
  };
  
  const buttonDisabledStyles = {
    ...buttonStyles,
    cursor: 'not-allowed',
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  };
    
  // Replaced Feather icon with an inline SVG
  const DownloadIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={{ marginRight: '8px' }}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );

  return (
    <PDFDownloadLink
      document={
        <PDFReport
          monthName={monthName}
          monthlyStats={monthlyStats}
          insights={insights}
          goalAchievements={goalAchievements}
        />
      }
      fileName={`life-tracker-report-${monthName.replace(" ", "-")}.pdf`}
      // This is now a standard anchor tag `<a>`, so we can style it via its child function
    >
      {({ blob, url, loading, error }) => {
        if (error) {
          console.error("PDF Download Error:", error);
          // Render a disabled button on error
          return <button style={buttonDisabledStyles} disabled>PDF ডাউনলোড ব্যর্থ</button>;
        }
        
        const style = loading ? buttonDisabledStyles : buttonStyles;
        return (
          <button style={style} disabled={loading}>
            <DownloadIcon />
            {loading ? "PDF তৈরি হচ্ছে..." : "PDF ডাউনলোড"}
          </button>
        );
      }}
    </PDFDownloadLink>
  );
};