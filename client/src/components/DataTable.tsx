import React from 'react';
import { Table, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

interface Properties {
    data: any,
    columns: ColumnsType<any>,
    pagination?: object,
    footer?: (currentPageData) => JSX.Element
    onRow?: (record, rowIndex) => {}
}

export const customSorter = (recordA, recordB, propertyName) => {
    if (recordA && !recordB) return 1;
    if (!recordA && recordB) return -1;
    if (!recordA && !recordB) return 0;

    return recordA[propertyName].localeCompare(recordB[propertyName]);
}

export const getColumnSearchProps = (
    propertyName: string,
    args?: {
        referencedPropertyName?: string,
        customFilter?: (valueToSearch, record) => boolean
    }
) => {
    return ({
        onFilter: (valueToSearch, record): boolean => {
            if (args) {
                if (args.referencedPropertyName) {
                    return record[propertyName][args.referencedPropertyName].toLowerCase().indexOf(valueToSearch.toString().toLowerCase()) >= 0;
                } else if (args.customFilter) {
                    return args.customFilter(valueToSearch, record);
                } else {
                    return false;
                }
            } else {
                return record[propertyName].toLowerCase().indexOf(valueToSearch.toString().toLowerCase()) >= 0;
            }
        },
        filterIcon: filtered => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        filterDropdown({ setSelectedKeys, selectedKeys, confirm, clearFilters }) {
            return (<div style={{ padding: 8 }}>
                <Input
                    // ref={node => {
                    //     this.searchInput = node;
                    // }}
                    placeholder='search'
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={confirm}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type='primary'
                    onClick={confirm}
                    icon={<SearchOutlined />}
                    size='small'
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
                </Button>
                <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
                    Reset
                </Button>
            </div>
            );
        },
    })
}

const DataTable = (props: Properties) => {
    return (
        <Table
            dataSource={props.data}
            columns={props.columns}
            pagination={props.pagination}
            footer={props.footer}
            onRow={props.onRow}
        />
    )
}

export default DataTable;