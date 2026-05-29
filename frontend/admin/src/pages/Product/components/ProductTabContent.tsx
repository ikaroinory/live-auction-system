import React, { useState } from 'react';
import { Table, Button, Input, Checkbox } from '@douyinfe/semi-ui';
import { IconFilter, IconPlus } from '@douyinfe/semi-icons';
import { ColumnProps, TableProps } from '@douyinfe/semi-ui/lib/es/table';

interface RecordType {
  id: number;
  [key: string]: unknown;
}

interface ProductTabContentProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  columns: ColumnProps<RecordType>[];
  dataSource: RecordType[];
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
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const rowSelection: TableProps<RecordType>['rowSelection'] = {
    selectedRowKeys: selectedKeys,
    onChange: (keys) => setSelectedKeys(keys),
    type: 'checkbox'
  };

  const isAllSelected = dataSource.length > 0 && selectedKeys.length === dataSource.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(dataSource.map(item => item.id));
    } else {
      setSelectedKeys([]);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Checkbox
            style={{ marginRight: 8 }}
            checked={isAllSelected}
            indeterminate={selectedKeys.length > 0 && !isAllSelected}
            onChange={handleSelectAll}
          />
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
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        rowSelection={rowSelection}
      />
    </div>
  );
};

export default ProductTabContent;
