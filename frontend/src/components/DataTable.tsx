import React from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface Properties {
    data: any,
    columns: ColumnsType<any>,
    pagination?: object,
    footer?: (currentPageData) => JSX.Element
    onRow?: (record, rowIndex) => {}
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