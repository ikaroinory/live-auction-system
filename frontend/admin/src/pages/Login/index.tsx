import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Form, Input, Button, Toast } from '@douyinfe/semi-ui';
import { IconLock, IconUser } from '@douyinfe/semi-icons';
import { useUserStore } from '@/store';
import { authService } from '@/services';
import './Login.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authService.login(values);
      login(response.user, response.token);
      Toast.success('登录成功');
      navigate('/dashboard');
    } catch (error: any) {
      Toast.error(error.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">直播竞拍管理系统</h1>
        <p className="login-subtitle">商家/主播端管理后台</p>
        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Input
            field="username"
            label="用户名"
            placeholder="请输入用户名"
            prefix={<IconUser />}
            rules={[{ required: true, message: '请输入用户名' }]}
          />
          <Form.Input
            field="password"
            label="密码"
            type="password"
            placeholder="请输入密码"
            prefix={<IconLock />}
            rules={[{ required: true, message: '请输入密码' }]}
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
