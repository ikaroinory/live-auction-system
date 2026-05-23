import { Layout } from '../../components/Layout';
import './My.scss';

export const My = () => {
  return (
    <Layout>
      <div className="my-page">
        <div className="header">
          <h1>个人中心</h1>
        </div>
        <div className="content">
          <p>个人中心页面</p>
        </div>
      </div>
    </Layout>
  );
};

export default My;
