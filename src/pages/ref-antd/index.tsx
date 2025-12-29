/**
 * @name 电商后台首页
 * 
 * 参考资料：
 * - /rules/development-standards.md
 * - /rules/axure-api-guide.md
 * - /assets/docs/设计规范.UIGuidelines.md
 * - /src/themes/antd/designToken.json (Ant Design 主题)
 * - /assets/libraries/antd.md (Ant Design 组件库)
 * 
 * ==================== 重要说明 ====================
 * 本文件是演示文件，用于展示 Axhub 页面开发规范
 * 文件中的详细注释【规范说明】仅用于教学和说明规范要求
 * 
 * 实际开发时：
 * 1. 只需保留 @name 和 参考资料 注释
 * 2. 不需要添加如此详细的规范说明注释
 * 3. 代码应该简洁清晰，避免冗余注释
 * 4. 只在复杂逻辑处添加必要的业务说明注释
 * ================================================
 */

// 【规范说明】导入顺序：
// 1. 样式文件（可选）
import './style.css';

// 2. React 和 Hooks（必需）
// 直接从 'react' 导入所需的 Hooks，不使用解构
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

// 3. 导入第三方库（可选，需要协助用户安装依赖）
// 【规范说明】按需导入 Ant Design 组件，减小打包体积
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  List,
  Avatar,
  Typography,
  Badge,
  DatePicker,
  theme
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingOutlined,
  UserOutlined,
  MoneyCollectOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';

// 4. 导入类型定义（必需）
// 从 axhub-types 导入所有必要的类型
import type {
  KeyDesc,
  DataDesc,
  ConfigItem,
  Action,
  EventItem,
  AxhubProps,
  AxhubHandle
} from '../../common/axhub-types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 【规范说明】事件列表定义
// 必须清晰描述每个事件的触发时机和用途
const EVENT_LIST: EventItem[] = [
  { name: 'onOrderClick', desc: '点击订单时触发' },
  { name: 'onProductClick', desc: '点击商品时触发' }
];

// 【规范说明】动作列表定义
// 必须说明每个动作的功能，如果有参数需要说明参数格式
const ACTION_LIST: Action[] = [
  { name: 'refreshData', desc: '刷新数据' }
];

// 【规范说明】变量列表定义
// 必须说明每个变量的类型和用途
const VAR_LIST: KeyDesc[] = [
  { name: 'selectedOrder', desc: '当前选中的订单' }
];

// 【规范说明】配置项列表定义
// 必须包含 initialValue，并清晰说明每个配置项的用途
const CONFIG_LIST: ConfigItem[] = [
  { type: 'input', attributeId: 'title', displayName: '页面标题', info: '显示在页面顶部的标题', initialValue: '电商后台概览' }
];

// 【规范说明】数据项列表定义
// 必须详细定义 keys，说明每个字段的含义和类型
const DATA_LIST: DataDesc[] = [
  {
    name: 'orders',
    desc: '最近订单',
    keys: [
      { name: 'id', desc: '订单号' },
      { name: 'customer', desc: '客户' },
      { name: 'amount', desc: '金额' },
      { name: 'status', desc: '状态' },
      { name: 'date', desc: '日期' }
    ]
  },
  {
    name: 'products',
    desc: '热销商品',
    keys: [
      { name: 'id', desc: '商品ID' },
      { name: 'name', desc: '商品名称' },
      { name: 'sales', desc: '销量' },
      { name: 'growth', desc: '增长率' }
    ]
  }
];

// 【规范说明】组件定义
// 必须使用 forwardRef<AxhubHandle, AxhubProps> 包装组件
const Component = forwardRef<AxhubHandle, AxhubProps>(function EcommerceDashboard(innerProps, ref) {
  // 【规范说明】Props 处理
  // 安全解构 props 并提供默认值，避免访问 undefined 属性
  const dataSource = innerProps && innerProps.data ? innerProps.data : {};
  const configSource = innerProps && innerProps.config ? innerProps.config : {};
  const onEventHandler = typeof innerProps.onEvent === 'function' ? innerProps.onEvent : function () { return undefined; };

  // 【规范说明】从 config 获取配置值
  // 使用类型检查避免使用 || 运算符（会误判 0、false 等值）
  const title = typeof configSource.title === 'string' && configSource.title ? configSource.title : '电商后台概览';
  
  const { token } = theme.useToken();

  // 【规范说明】默认数据定义
  // 为演示提供合理的默认数据
  const defaultOrders = [
    { id: 'ORD-2023001', customer: '张三', amount: 1299.00, status: 'completed', date: '2023-10-24' },
    { id: 'ORD-2023002', customer: '李四', amount: 899.50, status: 'processing', date: '2023-10-24' },
    { id: 'ORD-2023003', customer: '王五', amount: 2599.00, status: 'pending', date: '2023-10-23' },
    { id: 'ORD-2023004', customer: '赵六', amount: 128.00, status: 'rejected', date: '2023-10-23' },
    { id: 'ORD-2023005', customer: '孙七', amount: 599.00, status: 'completed', date: '2023-10-22' },
  ];

  const defaultProducts = [
    { id: 1, name: '无线降噪耳机 Pro', sales: 1234, growth: 12 },
    { id: 2, name: '智能运动手表 X', sales: 892, growth: -5 },
    { id: 3, name: '超薄机械键盘', sales: 645, growth: 8 },
    { id: 4, name: '4K 高清显示器', sales: 432, growth: 24 },
    { id: 5, name: '人体工学座椅', sales: 321, growth: 2 },
  ];

  const orders = Array.isArray(dataSource.orders) ? dataSource.orders : defaultOrders;
  const products = Array.isArray(dataSource.products) ? dataSource.products : defaultProducts;

  // 【规范说明】State 管理
  // 避免使用 ES6 解构，使用数组索引访问 state 和 setter
  const selectedOrderState = useState<any>(null);
  const selectedOrder = selectedOrderState[0];
  const setSelectedOrder = selectedOrderState[1];

  // 【规范说明】事件触发封装
  // 使用 useCallback 优化性能，包含错误处理
  const emitEvent = useCallback(function (eventName: string, payload?: any) {
    try {
      onEventHandler(eventName, payload);
    } catch (error) {
      console.warn('onEvent 调用失败:', error);
    }
  }, [onEventHandler]);

  // 【规范说明】useImperativeHandle
  // 必须暴露完整的 AxhubHandle 接口，包括所有列表和方法
  // 依赖项数组必须包含所有使用到的 state 和函数
  useImperativeHandle(ref, function () {
    return {
      getVar: function (name: string) {
        const vars: Record<string, any> = { selectedOrder };
        return vars[name];
      },
      fireAction: function (name: string, params?: any) {
        switch (name) {
          case 'refreshData':
            // 模拟刷新数据
            console.log('Refreshing data...');
            break;
          default:
            console.warn('未知的动作类型:', name);
        }
      },
      eventList: EVENT_LIST,
      actionList: ACTION_LIST,
      varList: VAR_LIST,
      configList: CONFIG_LIST,
      dataList: DATA_LIST
    };
  }, [selectedOrder]);

  // 【规范说明】业务逻辑处理
  // 使用 useCallback 包装所有回调函数，避免在 JSX 中直接定义函数
  const getStatusTag = useCallback(function (status: string) {
    switch (status) {
      case 'completed': return <Tag color="success">已完成</Tag>;
      case 'processing': return <Tag color="processing">处理中</Tag>;
      case 'pending': return <Tag color="warning">待支付</Tag>;
      case 'rejected': return <Tag color="error">已取消</Tag>;
      default: return <Tag>未知</Tag>;
    }
  }, []);

  const columns = [
    { title: '订单号', dataIndex: 'id', key: 'id' },
    { title: '客户', dataIndex: 'customer', key: 'customer' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    { title: '日期', dataIndex: 'date', key: 'date' },
    {
      title: '操作',
      key: 'action',
      render: function (_: any, record: any) {
        return (
          <Button type="link" size="small" onClick={function () {
            setSelectedOrder(record);
            emitEvent('onOrderClick', { order: record });
          }}>
            查看
          </Button>
        );
      }
    },
  ];

  // 【规范说明】JSX 渲染
  // 使用语义化的类名，添加组件前缀避免冲突
  // 避免在 JSX 中直接定义函数，使用预定义的 useCallback 函数
  return (
    <div className="ecommerce-dashboard">
      <div className="dashboard-header">
        <div>
          <Title level={2} style={{ margin: 0 }}>{title}</Title>
          <Text type="secondary">欢迎回来，今日概况如下</Text>
        </div>
        <Space>
          <RangePicker />
          <Button type="primary">导出报表</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="metric-cards">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="总销售额"
              value={126560}
              precision={2}
              valueStyle={{ color: token.colorSuccess }}
              prefix={<MoneyCollectOutlined />}
              suffix="¥"
            />
            <div className="metric-footer">
              <Text type="secondary">周同比 12% <ArrowUpOutlined style={{ color: token.colorSuccess }} /></Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="访问量"
              value={8846}
              valueStyle={{ color: token.colorSuccess }}
              prefix={<UserOutlined />}
            />
            <div className="metric-footer">
              <Text type="secondary">日同比 5% <ArrowUpOutlined style={{ color: token.colorSuccess }} /></Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="支付笔数"
              value={6560}
              valueStyle={{ color: token.colorError }}
              prefix={<ShoppingCartOutlined />}
            />
            <div className="metric-footer">
              <Text type="secondary">周同比 8% <ArrowDownOutlined style={{ color: token.colorError }} /></Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="转化率"
              value={12.5}
              precision={1}
              valueStyle={{ color: token.colorSuccess }}
              prefix={<ShoppingOutlined />}
              suffix="%"
            />
            <div className="metric-footer">
              <Text type="secondary">周同比 2% <ArrowUpOutlined style={{ color: token.colorSuccess }} /></Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="最近订单" bordered={false} extra={<Button type="link">查看全部</Button>}>
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="热销商品 Top 5" bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={products}
              renderItem={(item: any, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#1890ff' : '#d9d9d9' }} />}
                    title={item.name}
                    description={
                      <Space>
                        <Text>销量: {item.sales}</Text>
                        <Text type={item.growth > 0 ? 'success' : 'danger'}>
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
});

// 【规范说明】导出组件
// 必须使用 export default Component（大小写敏感）
// 这是 Axhub 平台集成的必要条件
export default Component;
