import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, NavBar, Toast } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import { authAPI } from '../../services/api';
import './Login.scss';

export const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useUserStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!phone || !code) {
      Toast.show('请填写手机号和验证码');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Toast.show('请输入正确的手机号');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authAPI.smsLogin(phone, code);
      
      localStorage.setItem('token', response.token);
      
      login({
        id: response.user.id,
        phone: response.user.phone,
        nickname: response.user.nickname,
        avatar: response.user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + response.user.id,
        vipLevel: 1,
        vipName: '普通会员',
        createdAt: new Date().toISOString(),
      });

      Toast.show(response.isNewUser ? '注册成功' : '登录成功');
      navigate('/');
    } catch (error: any) {
      Toast.show(error.response?.data?.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page page-container">
      <NavBar onBack={() => navigate(-1)}>登录</NavBar>
      
      <div className="login-content">
        <div className="logo">
          <div className="logo-icon">🎁</div>
          <h1>实时竞拍大师</h1>
          <p>抖音电商直播竞拍系统</p>
        </div>

        <div className="form">
          <div className="form-item">
            <label>手机号</label>
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={setPhone}
              maxLength={11}
            />
          </div>

          <div className="form-item">
            <label>验证码</label>
            <div className="code-input">
              <Input
                type="number"
                placeholder="请输入验证码"
                value={code}
                onChange={setCode}
                maxLength={6}
              />
              <Button size="small" disabled>
                获取验证码
              </Button>
            </div>
          </div>

          <Button 
            block 
            color="primary" 
            size="large"
            loading={loading}
            onClick={handleLogin}
          >
            登录
          </Button>
        </div>
      </div>
    </div>
  );
};
