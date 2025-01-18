"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Layout,
  Typography,
  Input,
  Button,
  Card,
  Row,
  Col,
  Badge,
  Space,
  Tooltip,
  Tag,
  message,
  Grid,
  Spin,
  Progress,
  Table,
} from "antd";
import {
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  CloudServerOutlined,
  LockOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { FixedSizeList as List } from "react-window";

const { Header, Footer, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Base URL for API
const BASE_URL = "https://cms1.creatorsmela.com";

// Utility functions to determine status color and icon
const getStatusColor = (status) => (status ? "success" : "error");

const getStatusIcon = (status) =>
  status ? <CheckCircleOutlined /> : <CloseCircleOutlined />;

// Table columns configuration
const columns = [
  {
    title: "Email Details",
    dataIndex: "email",
    key: "email",
    fixed: "left",
    width: 300,
    render: (email, record) => (
      <div className="flex items-center space-x-3">
        <Badge
          status={record.status === "Valid" ? "success" : "error"}
          aria-label={`Email status: ${record.status}`}
        />
        <div>
          <Text strong>{email}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.reason}
          </Text>
        </div>
      </div>
    ),
  },
  {
    title: "Basic Checks",
    children: [
      {
        title: "Syntax",
        dataIndex: "syntax_ok",
        key: "syntax_ok",
        width: 100,
        render: (value) => (
          <Tag
            icon={getStatusIcon(value)}
            color={getStatusColor(value)}
            aria-label={`Syntax ${value ? "Valid" : "Invalid"}`}
          >
            {value ? "Valid" : "Invalid"}
          </Tag>
        ),
      },
      {
        title: "Disposable",
        dataIndex: "disposable",
        key: "disposable",
        width: 120,
        render: (value) => (
          <Tag
            icon={getStatusIcon(!value)}
            color={getStatusColor(!value)}
            aria-label={`Disposable ${value ? "Yes" : "No"}`}
          >
            {value ? "Yes" : "No"}
          </Tag>
        ),
      },
      {
        title: "Free Provider",
        dataIndex: "free_provider",
        key: "free_provider",
        width: 120,
        render: (value) => (
          <Tag
            icon={getStatusIcon(!value)}
            color={getStatusColor(!value)}
            aria-label={`Free Provider ${value ? "Yes" : "No"}`}
          >
            {value ? "Yes" : "No"}
          </Tag>
        ),
      },
    ],
  },
  {
    title: "Server Verification",
    children: [
      {
        title: "DNS",
        dataIndex: "dns_ok",
        key: "dns_ok",
        width: 100,
        render: (value) => (
          <Tag
            icon={getStatusIcon(value)}
            color={getStatusColor(value)}
            aria-label={`DNS ${value ? "Valid" : "Invalid"}`}
          >
            {value ? "Valid" : "Invalid"}
          </Tag>
        ),
      },
      {
        title: "SMTP",
        dataIndex: "smtp_ok",
        key: "smtp_ok",
        width: 100,
        render: (value) => (
          <Tag
            icon={getStatusIcon(value)}
            color={getStatusColor(value)}
            aria-label={`SMTP ${value ? "Valid" : "Invalid"}`}
          >
            {value ? "Valid" : "Invalid"}
          </Tag>
        ),
      },
      {
        title: "Mailbox",
        dataIndex: "mailbox_ok",
        key: "mailbox_ok",
        width: 100,
        render: (value) => (
          <Tag
            icon={getStatusIcon(value)}
            color={getStatusColor(value)}
            aria-label={`Mailbox ${value ? "Valid" : "Invalid"}`}
          >
            {value ? "Valid" : "Invalid"}
          </Tag>
        ),
      },
    ],
  },
  {
    title: "Security Checks",
    children: [
      {
        title: "SPF",
        dataIndex: "spf_ok",
        key: "spf_ok",
        width: 100,
        render: (value) => (
          <Tag
            icon={getStatusIcon(value)}
            color={getStatusColor(value)}
            aria-label={`SPF ${value ? "Valid" : "Invalid"}`}
          >
            {value ? "Valid" : "Invalid"}
          </Tag>
        ),
      },
      {
        title: "DKIM",
        dataIndex: "dkim_ok",
        key: "dkim_ok",
        width: 100,
        render: (value) => (
          <Tag
            icon={getStatusIcon(value)}
            color={getStatusColor(value)}
            aria-label={`DKIM ${value ? "Valid" : "Invalid"}`}
          >
            {value ? "Valid" : "Invalid"}
          </Tag>
        ),
      },
    ],
  },
  {
    title: "Additional Info",
    children: [
      {
        title: "Catch All",
        dataIndex: "catch_all",
        key: "catch_all",
        width: 100,
        render: (value) => (
          <Tag
            color={value ? "warning" : "default"}
            aria-label={`Catch All ${value ? "Yes" : "No"}`}
          >
            {value ? "Yes" : "No"}
          </Tag>
        ),
      },
      {
        title: "Role Account",
        dataIndex: "role_account",
        key: "role_account",
        width: 120,
        render: (value) => (
          <Tag
            color={value ? "warning" : "default"}
            aria-label={`Role Account ${value ? "Yes" : "No"}`}
          >
            {value ? "Yes" : "No"}
          </Tag>
        ),
      },
    ],
  },
];

// Header Component
const AppHeader = React.memo(() => (
  <Header className="header">
    <div className="logo">
      <MailOutlined className="logo-icon" />
      <Title level={3} className="logo-title">
        Email Validator
      </Title>
    </div>
  </Header>
));

// Footer Component
const AppFooter = React.memo(() => (
  <Footer className="footer">
    <Text type="secondary">
      © {new Date().getFullYear()} Email Verification Suite by CreatorsMela
    </Text>
  </Footer>
));

// Email Verification Form Component
const EmailVerificationForm = React.memo(
  ({ inputValue, setInputValue, handleVerifyEmails, loading, health }) => (
    <Card
      className="card"
      title={
        <div className="card-title">
          <SecurityScanOutlined className="card-icon" />
          <Text strong>Verify Your Emails</Text>
        </div>
      }
    >
      <Input.TextArea
        rows={6}
        placeholder="Enter email addresses (one per line)"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="input-area"
        aria-label="Email Input"
      />

      {/* <Space className="health-stats" size="middle" wrap>
        <Tooltip title="Total Emails">
          <Card
            size="small"
            className="stat-card"
            aria-label={`Total Emails: ${health.total}`}
          >
            <Text type="secondary">Total</Text>
            <br />
            <Text strong className="stat-number">
              {health.total}
            </Text>
          </Card>
        </Tooltip>
        <Tooltip title="Valid Emails">
          <Card
            size="small"
            className="stat-card"
            aria-label={`Valid Emails: ${health.valid}`}
          >
            <Text type="success">Valid</Text>
            <br />
            <Text strong className="stat-number valid">
              {health.valid}
            </Text>
          </Card>
        </Tooltip>
        <Tooltip title="Invalid Emails">
          <Card
            size="small"
            className="stat-card"
            aria-label={`Invalid Emails: ${health.invalid}`}
          >
            <Text type="danger">Invalid</Text>
            <br />
            <Text strong className="stat-number invalid">
              {health.invalid}
            </Text>
          </Card>
        </Tooltip>
      </Space> */}

      <Button
        type="primary"
        size="large"
        icon={loading ? <LoadingOutlined /> : <CheckCircleOutlined />}
        onClick={handleVerifyEmails}
        disabled={loading}
        className="verify-button"
        aria-label="Verify Emails"
      >
        {loading ? "Verifying..." : "Verify Emails"}
      </Button>
    </Card>
  )
);

// Verification Process Component
const VerificationProcess = React.memo(() => (
  <Card
    className="card"
    title={
      <div className="card-title">
        <SecurityScanOutlined className="card-icon" />
        <Text strong>Verification Process</Text>
      </div>
    }
  >
    <div className="process-steps">
      <div className="process-step">
        <LockOutlined className="step-icon lock" />
        <div>
          <Text strong>Basic Validation</Text>
          <Text className="step-description">
            Checks email syntax, disposable domains, and provider type
          </Text>
        </div>
      </div>

      <div className="process-step">
        <CloudServerOutlined className="step-icon cloud" />
        <div>
          <Text strong>Server Verification</Text>
          <Text className="step-description">
            Validates DNS records, SMTP connection, and mailbox existence
          </Text>
        </div>
      </div>

      <div className="process-step">
        <SecurityScanOutlined className="step-icon security" />
        <div>
          <Text strong>Security Analysis</Text>
          <Text className="step-description">
            Examines SPF and DKIM records for enhanced security
          </Text>
        </div>
      </div>
    </div>
  </Card>
));

// Virtualized Row Component for Large Lists
const VirtualizedRow = React.memo(({ index, style, data }) => {
  const email = data[index];
  return (
    <div style={style} key={email.email}>
      <Card
        type="inner"
        className="result-card"
        title={
          <div className="flex items-center space-x-2">
            <Badge
              status={email.status === "Valid" ? "success" : "error"}
              aria-label={`Email status: ${email.status}`}
            />
            <Text strong>{email.email}</Text>
          </div>
        }
      >
        <Space direction="vertical" size="8px">
          <Text>
            <strong>Syntax:</strong> {email.syntax_ok ? "Valid" : "Invalid"}
          </Text>
          <Text>
            <strong>Disposable:</strong> {email.disposable ? "Yes" : "No"}
          </Text>
          <Text>
            <strong>Free Provider:</strong> {email.free_provider ? "Yes" : "No"}
          </Text>
          <Text>
            <strong>DNS:</strong> {email.dns_ok ? "Valid" : "Invalid"}
          </Text>
          <Text>
            <strong>SMTP:</strong> {email.smtp_ok ? "Valid" : "Invalid"}
          </Text>
          <Text>
            <strong>Mailbox:</strong> {email.mailbox_ok ? "Valid" : "Invalid"}
          </Text>
          <Text>
            <strong>SPF:</strong> {email.spf_ok ? "Valid" : "Invalid"}
          </Text>
          <Text>
            <strong>DKIM:</strong> {email.dkim_ok ? "Valid" : "Invalid"}
          </Text>
          <Text>
            <strong>Catch All:</strong> {email.catch_all ? "Yes" : "No"}
          </Text>
          <Text>
            <strong>Role Account:</strong> {email.role_account ? "Yes" : "No"}
          </Text>
          {email.reason && (
            <Text type="warning">
              <strong>Reason:</strong> {email.reason}
            </Text>
          )}
        </Space>
      </Card>
    </div>
  );
});

// Verification Results Table or Cards Component
const VerificationResults = React.memo(({ emails }) => {
  const screens = useBreakpoint();
  const isSmallScreen = !screens.md; // Consider md and above as large screens

  // Virtualized list height calculation
  const listHeight = 600; // Adjust based on your layout
  const rowHeight = 300; // Approximate height of each card

  return (
    <Card
      className="card"
      title={
        <div className="card-title">
          <InfoCircleOutlined className="card-icon" />
          <Text strong>Verification Results</Text>
        </div>
      }
    >
      {isSmallScreen ? (
        <List
          height={listHeight}
          itemCount={emails.length}
          itemSize={rowHeight}
          width="100%"
          itemData={emails}
        >
          {VirtualizedRow}
        </List>
      ) : (
        <Table
          dataSource={emails}
          columns={columns}
          rowKey="email"
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          className="verification-table"
          aria-label="Verification Results Table"
        />
      )}
    </Card>
  );
});

// Main Home Component
export default function Home() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [health, setHealth] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
  });
  const [errorCount, setErrorCount] = useState(0);

  // Memoized health stats to prevent unnecessary recalculations
  const healthStats = useMemo(() => health, [health]);

  // Retry logic for API requests
  const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    try {
      return await axios.post(url, options);
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise((res) => setTimeout(res, delay));
      return fetchWithRetry(url, options, retries - 1, delay);
    }
  };

  const handleVerifyEmails = async () => {
    if (!inputValue.trim()) {
      message.warning("Please enter at least one email address.");
      return;
    }

    setLoading(true);
    setErrorCount(0);

    try {
      const emailList = inputValue
        .split("\n")
        .map((email) => email.trim())
        .filter((email) => email);

      if (emailList.length === 0) {
        message.warning("Please enter valid email addresses.");
        setLoading(false);
        return;
      }

      const response = await fetchWithRetry(`${BASE_URL}/verify`, {
        emails: emailList,
      });

      // Assuming API returns data in the expected format
      if (response && response.data) {
        setEmails(response.data);

        const validCount = response.data.filter(
          (email) => email.status === "Valid"
        ).length;
        setHealth({
          total: response.data.length,
          valid: validCount,
          invalid: response.data.length - validCount,
        });

        // Check for any emails with errors
        const errors = response.data.filter(
          (email) => email.status !== "Valid"
        );
        setErrorCount(errors.length);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error(error);
      message.error({
        content:
          "Failed to verify emails. Please check your network connection and try again.",
        icon: <InfoCircleOutlined style={{ color: "#ff4d4f" }} />,
      });
      setErrorCount((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="layout">
      {/* <AppHeader /> */}
      <Content className="content">
        <div className="header-section">
          <Title level={1} className="main-title">
            Email Verification Suite
          </Title>
          <Text className="subtitle">
            Validate your email list with our comprehensive verification system
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <EmailVerificationForm
              inputValue={inputValue}
              setInputValue={setInputValue} // Removed debounce here
              handleVerifyEmails={handleVerifyEmails}
              loading={loading}
              health={healthStats}
            />
          </Col>

          <Col xs={24} lg={14}>
            <VerificationProcess />
          </Col>

          {emails.length > 0 && (
            <Col span={24}>
              <VerificationResults emails={emails} />
            </Col>
          )}
        </Row>

        {/* Progress Bar */}
        {loading && (
          <div className="progress-bar" aria-label="Verification Progress">
            <Progress
              percent={
                health.total
                  ? Math.round(
                      ((health.valid + health.invalid) / health.total) * 100
                    )
                  : 0
              }
              status="active"
              showInfo={false}
            />
          </div>
        )}
      </Content>
      <AppFooter />

      {/* Global Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

        body {
          font-family: "Inter", sans-serif;
          background-color: #f3f4f6;
          margin: 0;
          padding: 0;
          color: #1f2937;
        }

        .layout {
          background: #ffffff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Header Styles */
        .header {
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
        }

        .logo-icon {
          font-size: 24px;
          color: #ffffff;
        }

        .logo-title {
          margin: 0;
          margin-left: 8px;
          color: #ffffff;
          font-size: 20px;
        }

        /* Footer Styles */
        .footer {
          text-align: center;
          background: #f9fafb;
          padding: 16px;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
        }

        /* Content Styles */
        .content {
          padding: 24px;
          flex-grow: 1;
        }

        .header-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .main-title {
          font-weight: 700;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }

        /* Card Styles */
        .card {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          background: #ffffff;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-icon {
          font-size: 20px;
          color: #3b82f6;
        }

        /* Input Area */
        .input-area {
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
          border: 1px solid #d1d5db;
          transition: border-color 0.3s ease;
          font-family: "Inter", monospace;
        }

        .input-area:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        /* Health Stats */
        .health-stats {
          margin-bottom: 16px;
        }

        .stat-card {
          text-align: center;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .stat-number {
          font-size: 20px;
          font-weight: 600;
          margin-top: 4px;
        }

        .stat-number.valid {
          color: #22c55e;
        }

        .stat-number.invalid {
          color: #ef4444;
        }

        /* Verify Button */
        .verify-button {
          width: 100%;
          height: 48px;
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          border-radius: 8px;
          background: linear-gradient(90deg, #3b82f6, #2563eb);
          border: none;
          transition: background 0.3s ease, transform 0.3s ease;
        }

        .verify-button:hover {
          background: linear-gradient(90deg, #2563eb, #1e40af);
          transform: translateY(-2px);
        }

        /* Verification Process Steps */
        .process-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .process-step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .step-icon {
          font-size: 24px;
          margin-top: 4px;
        }

        .step-icon.lock {
          color: #3b82f6;
        }

        .step-icon.cloud {
          color: #22c55e;
        }

        .step-icon.security {
          color: #8b5cf6;
        }

        .step-description {
          display: block;
          color: #6b7280;
          font-size: 14px;
        }

        /* Verification Table */
        .verification-table .ant-table-thead > tr > th {
          background: #f1f5f9;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 14px;
          color: #4b5563;
          border-bottom: 1px solid #e5e7eb;
        }

        .verification-table .ant-table-tbody > tr:hover > td {
          background: #e5e7eb;
        }

        /* Result Cards */
        .result-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Progress Bar */
        .progress-bar {
          margin-top: 24px;
        }

        /* Responsive Adjustments */
        @media (max-width: 992px) {
          .main-title {
            font-size: 24px;
          }

          .subtitle {
            font-size: 14px;
          }

          .verify-button {
            font-size: 14px;
            height: 40px;
          }

          .stat-number {
            font-size: 18px;
          }

          .step-description {
            font-size: 13px;
          }
        }

        @media (max-width: 576px) {
          .main-title {
            font-size: 20px;
          }

          .subtitle {
            font-size: 12px;
          }

          .verify-button {
            font-size: 14px;
            height: 40px;
          }

          .stat-number {
            font-size: 16px;
          }

          .step-description {
            font-size: 12px;
          }

          .card {
            margin-bottom: 16px;
          }
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Virtualized Cell Styles */
        .virtualized-cell {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          box-sizing: border-box;
          display: flex;
          align-items: center;
        }
      `}</style>
    </Layout>
  );
}
