import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Form, Input, Button, Toast } from '@douyinfe/semi-ui';
import { IconPhone, IconKey } from '@douyinfe/semi-icons';
import { useUserStore } from '@/store';
import { authService } from '@/services';
import './Login.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      login(response.user, response.token);
      Toast.success('登录成功');
      navigate('/dashboard');
    } catch (error: any) {
      Toast.error(error.response?.data?.message || '登录失败，请检查手机号和验证码');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (values: { phone: string }) => {
    if (!/^1[3-9]\d{9}$/.test(values.phone)) {
      Toast.error('请输入正确的手机号');
      return;
    }

    setCodeLoading(true);
    try {
      Toast.success('验证码已发送，测试环境验证码为 123456 或 666666');
      setCountdown(60);
    } catch (error: any) {
      Toast.error(error.response?.data?.message || '发送验证码失败');
    } finally {
      setCodeLoading(false);
    }
  };

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">直播竞拍管理系统</h1>
        <p className="login-subtitle">商家/主播端管理后台</p>
        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Input
            field="phone"
            label="手机号"
            placeholder="请输入手机号"
            prefix={<IconPhone />}
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' },
            ]}
          />
          <Form.Input
            field="code"
            label="验证码"
            placeholder="请输入验证码"
            prefix={<IconKey />}
            rules={[
              { required: true, message: '请输入验证码' },
              { pattern: /^\d{6}$/, message: '请输入6位验证码' },
            ]}
            extra={
              <Button
                type="tertiary"
                size="small"
                disabled={countdown > 0 || codeLoading}
                onClick={() => {
                  handleSendCode({ phone: '' });
                }}
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </Button>
            }
          />
          <Button
            htmlType="submit"
            className="login-button"
            loading={loading}
          >
            登录
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;
