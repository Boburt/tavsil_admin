import Head from 'next/head'
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Table,
  Tooltip,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import getConfig from 'next/config'
import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useDarkMode } from 'next-dark-mode'
import MainLayout from '@components/ui/MainLayout'
import authRequired from '@services/authRequired'
import Cookies from 'js-cookie'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

axios.defaults.withCredentials = true

export default function Menus() {
  const user = authRequired({})
  const {
    darkModeActive, // boolean - whether the dark mode is active or not
  } = useDarkMode()
  useEffect(() => {
    if (!user) {
      return
    }
  }, [])

  const [isDrawerVisible, setDrawer] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null as any)
  const [isMenuDrawerVisible, setMenuDrawer] = useState(false)
  const [editingMenuRecord, setEditingMenuRecord] = useState(null as any)
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuLoading, setIsMenuLoading] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [isMenuSubmittingForm, setIsMenuSubmittingForm] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })
  const [data, setData] = useState([])
  const [menuData, setMenuData] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([] as number[])

  let searchInput = useRef(null)
  const [form] = Form.useForm()
  const [menuForm] = Form.useForm()

  const closeDrawer = () => {
    setEditingRecord(null)
    setDrawer(false)
  }

  const editRecord = (record: any) => {
    setEditingRecord(record)
    form.resetFields()
    form.setFieldsValue(record)
    setDrawer(true)
  }

  const addRecord = () => {
    setEditingRecord(null)
    form.resetFields()
    setDrawer(true)
  }

  const closeMenuDrawer = () => {
    setEditingMenuRecord(null)
    setMenuDrawer(false)
  }

  const editMenuRecord = (record: any) => {
    setEditingMenuRecord(record)
    menuForm.resetFields()
    menuForm.setFieldsValue(record)
    setMenuDrawer(true)
  }

  const deleteMenuItem = async (record: any) => {
    setIsMenuLoading(true)
    await axios.delete(`${webAddress}/api/menu_items/${record.id}`)
    menuItems()
  }

  const addMenuRecord = () => {
    setEditingMenuRecord(null)
    menuForm.resetFields()
    setMenuDrawer(true)
  }

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm()
    // this.setState({
    //   searchText: selectedKeys[0],
    //   searchedColumn: dataIndex,
    // })
  }

  const handleReset = (clearFilters: any) => {
    clearFilters()
    // this.setState({ searchText: '' })
  }

  const fetchData = async () => {
    setIsLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/menu_types`)
    setData(result)
    setIsLoading(false)
  }

  const menuItems = async (selectedId: number = 0) => {
    setIsMenuLoading(true)
    const {
      data: { data: result },
    } = await axios.get(
      `${webAddress}/api/menu_items?type_id=${
        selectedId ? selectedId : selectedRowKeys[0]
      }`
    )
    setMenuData(result)
    setIsMenuLoading(false)
  }

  const setAxiosCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const onFinish = async (values: any) => {
    setIsSubmittingForm(true)
    await setAxiosCredentials()
    if (editingRecord) {
      await axios.put(`${webAddress}/api/menu_types/${editingRecord?.id}`, {
        ...editingRecord,
        ...values,
      })
    } else {
      await axios.post(`${webAddress}/api/menu_types/`, {
        ...values,
      })
    }
    setIsSubmittingForm(false)
    closeDrawer()
    fetchData()
  }

  const submitForm = () => {
    form.submit()
  }

  const onMenuFinish = async (values: any) => {
    setIsMenuSubmittingForm(true)
    await setAxiosCredentials()
    if (editingMenuRecord) {
      await axios.put(`${webAddress}/api/menu_items/${editingMenuRecord?.id}`, {
        ...editingMenuRecord,
        ...values,
        type_id: selectedRowKeys[0],
      })
    } else {
      await axios.post(`${webAddress}/api/menu_items/`, {
        ...values,
        type_id: selectedRowKeys[0],
      })
    }
    setIsMenuSubmittingForm(false)
    closeMenuDrawer()
    menuItems()
  }

  const submitMenuForm = () => {
    menuForm.submit()
  }

  const onSearch = async (value: any) => {
    setIsLoading(true)
    const {
      data: { data: result },
    } = await axios.get(`${webAddress}/api/menu_types?search=${value}`)
    setData(result)
    setIsLoading(false)
  }

  const menuTypeSelectionChange = (selectedRowKeys: any) => {
    // console.log('davr')
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns = [
    {
      title: '????????????????',
      dataIndex: 'action',
      render: (_: any, record: any) => {
        return (
          <div className="space-x-2">
            <Tooltip title="??????????????????????????">
              <Button
                type="primary"
                shape="circle"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  editRecord(record)
                }}
              />
            </Tooltip>
          </div>
        )
      },
    },
    {
      title: '??????',
      dataIndex: 'code',
      key: 'code',
    },
  ]

  const menuColumns = [
    {
      title: '????????????????',
      dataIndex: 'action',
      render: (_: any, record: any) => {
        return (
          <div className="space-x-2">
            <Tooltip title="??????????????????????????">
              <Button
                type="primary"
                shape="circle"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  editMenuRecord(record)
                }}
              />
            </Tooltip>
            <Popconfirm
              title="???? ??????????????, ?????? ???????????? ???????????????"
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              onConfirm={() => deleteMenuItem(record)}
              okText="????"
              cancelText="??????"
            >
              <Button
                type="primary"
                danger
                shape="circle"
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </div>
        )
      },
    },
    {
      title: '????????????????(RU)',
      dataIndex: 'name_ru',
      key: 'name_ru',
    },
    {
      title: '????????????????(UZ)',
      dataIndex: 'name_uz',
      key: 'name_uz',
    },
    {
      title: '????????????????(En)',
      dataIndex: 'name_en',
      key: 'name_en',
    },
    {
      title: '????????????',
      dataIndex: 'href',
      key: 'href',
    },
    {
      title: '????????????????????',
      dataIndex: 'sort',
      key: 'sort',
    },
  ]

  return (
    <MainLayout title="???????????? ????????">
      <Drawer
        title={
          editingRecord ? '?????????????????????????? ?????? ????????' : '???????????????? ?????????? ?????? ????????'
        }
        width={720}
        onClose={closeDrawer}
        visible={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
              ????????????
            </Button>
            <Button
              onClick={submitForm}
              loading={isSubmittingForm}
              type="primary"
            >
              ??????????????????
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={form}
          size="small"
          onFinish={onMenuFinish}
          initialValues={editingRecord ? editingRecord : undefined}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="??????"
                rules={[{ required: true, message: '?????????????? ???????????? ??????' }]}
              >
                <Input placeholder="?????????????? ???????????? ??????" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <Drawer
        title={
          editingMenuRecord
            ? '?????????????????????????? ?????????? ????????'
            : '???????????????? ?????????? ?????????? ????????'
        }
        width={720}
        onClose={closeMenuDrawer}
        visible={isMenuDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={closeMenuDrawer} style={{ marginRight: 8 }}>
              ????????????
            </Button>
            <Button
              onClick={submitMenuForm}
              loading={isMenuSubmittingForm}
              type="primary"
            >
              ??????????????????
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={menuForm}
          size="small"
          onFinish={onMenuFinish}
          initialValues={editingMenuRecord ? editingMenuRecord : undefined}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name_ru"
                label="??????????????????(RU)"
                rules={[
                  { required: true, message: '?????????????? ???????????? ??????????????????' },
                ]}
              >
                <Input placeholder="?????????????? ???????????? ??????????????????" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_uz"
                label="??????????????????(UZ)"
                rules={[
                  { required: true, message: '?????????????? ???????????? ??????????????????' },
                ]}
              >
                <Input placeholder="?????????????? ???????????? ??????????????????" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name_en"
                label="??????????????????(EN)"
                rules={[
                  { required: true, message: '?????????????? ???????????? ??????????????????' },
                ]}
              >
                <Input placeholder="?????????????? ???????????? ??????????????????" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="href"
                label="????????????"
                rules={[{ required: true, message: '?????????????? ???????????? ????????????' }]}
              >
                <Input placeholder="?????????????? ???????????? ????????????" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="????????????????????"
                rules={[
                  { required: true, message: '?????????????? ???????????? ????????????????????' },
                ]}
              >
                <Input placeholder="?????????????? ???????????? ????????????????????" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      <Row gutter={16}>
        <Col span={8}>
          <div className="flex justify-between mb-3">
            <Button type="primary" onClick={addRecord}>
              <PlusOutlined /> ????????????????
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            loading={isLoading}
            showHeader={false}
            rowKey="id"
            size="small"
            bordered
            rowSelection={{
              selectedRowKeys,
              onChange: menuTypeSelectionChange,
            }}
            onRow={(record: any, rowIndex: number | undefined) => {
              return {
                onClick: (event) => {
                  setSelectedRowKeys([record.id])
                  menuItems(record.id)
                },
              }
            }}
          />
        </Col>
        <Col span={16}>
          <div className="flex justify-between mb-3">
            <Button
              type="primary"
              onClick={addMenuRecord}
              disabled={!selectedRowKeys.length}
            >
              <PlusOutlined /> ????????????????
            </Button>
          </div>
          <Table
            columns={menuColumns}
            dataSource={menuData}
            loading={isMenuLoading}
            rowKey="id"
            size="small"
            bordered
          />
        </Col>
      </Row>
    </MainLayout>
  )
}
