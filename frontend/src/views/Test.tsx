import React from 'react';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

const Test = () => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [dataDisplay, setDataDisplay] = React.useState<string>('');

    const handleChange = (event) => {
        const files = event.target.files
        const file = files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            if (e && e.target && e.target.result) {
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                /* Get first worksheet */
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                /* Convert array of arrays */
                const data = XLSX.utils.sheet_to_json(ws, { blankrows: false });
                console.log(data);
                const filteredData = removeTrailingBlankRows(data);
                console.log(filteredData);
                
                const newSheet = XLSX.utils.json_to_sheet(filteredData);
                const htmlData = XLSX.utils.sheet_to_html(ws);
                setDataDisplay(htmlData);
            }
        };
        reader.readAsBinaryString(file);
    };

    const removeTrailingBlankRows = (dataArr) => {
        return _.filter(dataArr, elem => {
            return _.has(elem, 'Name');
        });
    }

    return (
        <>
            {/* <Upload
                accept='xlsx'
                name="grades"
                //action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                //beforeUpload={beforeUpload} // FIXME OMFG DATA HANDLING LATER THIS IS A PAIN IN THE ASS!
                onChange={handleChange}
                multiple={false}
            >
                <div>
                    {isLoading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                </div>
            </Upload> */}
            <input type='file' name='grades' onChange={handleChange} />
            <div dangerouslySetInnerHTML={{ __html: dataDisplay }}></div>
        </>
    );
}

export default Test;