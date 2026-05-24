import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, NavBar, Toast } from 'antd-mobile';
import { useUserStore } from '../../store/useUserStore';
import './Login.scss';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !code) {
      Toast.show('请填写手机号和验证码');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      login({
        id: Date.now(),
        username: `用户${phone.slice(-4)}`,
        phone,
        createdAt: new Date().toISOString(),
      });

      Toast.show('登录成功');
      navigate('/');
    } catch (error) {
      Toast.show('登录失败，请稍后重试');
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
