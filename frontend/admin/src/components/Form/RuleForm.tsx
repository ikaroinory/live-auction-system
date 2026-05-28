import React from 'react';
import {
  Form,
  InputNumber,
  Switch,
  Typography,
  Space,
  Card,
} from '@douyinfe/semi-ui';
import type { RuleConfig } from '@/types';

const { Title, Text } = Typography;

interface RuleFormProps {
  initialValues?: Partial<RuleConfig>;
  onValuesChange?: (values: Partial<RuleConfig>) => void;
}

const RuleForm: React.FC<RuleFormProps> = ({
  initialValues,
  onValuesChange,
}) => {
  return (
    <Card style={{ background: '#f8f9fa' }}>
      <Title heading={6} style={{ marginBottom: 16 }}>
        高级规则配置
      </Title>

      <Space vertical align="start" spacing="loose" style={{ width: '100%' }}>
        <div style={{ width: '100%' }}>
          <Form.InputNumber
            field="minIncrement"
            label="最小加价幅度"
            placeholder="1.00"
            prefix="¥"
            min={0.01}
            step={0.01}
            precision={2}
            initValue={initialValues?.minIncrement}
            style={{ width: '100%' }}
            rules={[
              { required: true, message: '请输入最小加价幅度' },
              { type: 'number', min: 0.01, message: '加价幅度必须大于0' },
            ]}
          />
          <Text type="tertiary" size="small">
            每次出价必须高于当前价格的最小增幅
          </Text>
        </div>

        <div style={{ width: '100%' }}>
          <Form.InputNumber
            field="maxPrice"
            label="封顶价"
            placeholder="不设置封顶"
            prefix="¥"
            min={0}
            step={1}
            precision={2}
            initValue={initialValues?.maxPrice}
            style={{ width: '100%' }}
            rules={[
              {
                type: 'number',
                min: 0,
                message: '封顶价不能为负数',
              },
            ]}
          />
          <Text type="tertiary" size="small">
            设置后，竞拍价格不能超过此金额
          </Text>
        </div>

        <div style={{ width: '100%' }}>
          <Form.InputNumber
            field="maxBidsPerUser"
            label="用户最大出价次数"
            placeholder="无限制"
            min={1}
            max={100}
            initValue={initialValues?.maxBidsPerUser}
            style={{ width: '100%' }}
            rules={[
              {
                type: 'number',
                min: 1,
                message: '出价次数至少为1',
              },
              {
                type: 'number',
                max: 100,
                message: '出价次数不能超过100',
              },
            ]}
          />
          <Text type="tertiary" size="small">
            每个用户最多出价次数（可选）
          </Text>
        </div>

        <div style={{ width: '100%' }}>
          <Form.Switch
            field="enableAutoExtend"
            label="启用自动延时"
            initValue={initialValues?.enableAutoExtend ?? true}
            onChange={(checked) => {
              onValuesChange?.({ enableAutoExtend: checked });
            }}
          />
          <Text type="tertiary" size="small">
            竞拍结束前有人出价时，自动延长竞拍时间
          </Text>
        </div>

        {initialValues?.enableAutoExtend !== false && (
          <div style={{ width: '100%' }}>
            <Form.InputNumber
              field="autoExtendSeconds"
              label="延时时间"
              placeholder="15"
              suffix="秒"
              min={5}
              max={60}
              initValue={initialValues?.autoExtendSeconds || 15}
              style={{ width: '100%' }}
              rules={[
                { required: true, message: '请输入延时时间' },
                { type: 'number', min: 5, message: '延时时间至少5秒' },
                { type: 'number', max: 60, message: '延时时间不能超过60秒' },
              ]}
            />
            <Text type="tertiary" size="small">
              每次延时增加的时长
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default RuleForm;
