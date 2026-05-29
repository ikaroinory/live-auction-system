import React from 'react';
import { Table, Button, Input, Checkbox } from '@douyinfe/semi-ui';
import { IconFilter, IconPlus } from '@douyinfe/semi-icons';

interface TableRecord {
  id: number;
  [key: string]: unknown;
}

interface TableColumn<T extends TableRecord = TableRecord> {
  title: string;
  dataIndex?: string;
  width?: number | string;
  render?: (text: unknown, record: T, index: number) => React.ReactNode;
}

interface ProductTabContentProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  columns: TableColumn[];
  dataSource: TableRecord[];
  showAddButton?: boolean;
  onAddClick?: () => void;
}

const ProductTabContent: React.FC<ProductTabContentProps> = ({
  searchValue,
  onSearchChange,
  columns,
  dataSource,
  showAddButton = false,
  onAddClick
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Checkbox style={{ marginRight: 8 }} />
          <span style={{ color: '#999', fontSize: 14 }}>全选</span>
          <Input
            placeholder="请搜索商品名称或ID"
            value={searchValue}
            onChange={onSearchChange}
            style={{ width: 300 }}
          />
          <Button size="small" theme="borderless" icon={<IconFilter />}>筛选</Button>
        </div>
        {showAddButton && onAddClick && (
          <Button icon={<IconPlus />} onClick={onAddClick}>添加商品</Button>
        )}
      </div>
      <Table columns={columns} dataSource={dataSource} rowKey="id" />
    </div>
  );
};

export default ProductTabContent;
