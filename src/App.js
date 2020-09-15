import React, {useEffect, useState} from 'react';
import { Motion, spring } from 'react-motion';
import Network from "./network";
import {getKeepRandomBeaconImplementation} from "./contracts";
import { Button, Modal } from 'antd'
import web3 from 'web3'
import keepLogo from './images/keephelper_logo.png'
import loadingSpinner from './images/infinityLoader.svg'
import Tag from "antd/es/tag";
import Table from "antd/es/table";
import { Layout, Menu } from 'antd';
import {
    NumberOutlined
} from '@ant-design/icons';

const getRevertReason = require('eth-revert-reason')
const { Sider } = Layout;

function AlphabetSpinner(props) {
    const alphabets = '\',: @-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.'.split('');

    const findPosition = (char) => {
        return alphabets.indexOf(char);
    };

        return (
            <Motion defaultStyle={{top: 0}} style={{top: spring(findPosition(props.alphabet)) }}>
                {val => {
                    let style = {
                        position: 'absolute',
                        top: (val.top*55)*-1
                    }
                    return (
                        <div className="bit">
                            <div style={style}>
                                {alphabets.map(char => {
                                    let bitClass = 'bit-char';
                                    if(char === props.alphabet){
                                        bitClass += ' active '
                                    }
                                    return <div key={char} className={bitClass}>{char}</div>
                                })}
                            </div>
                        </div>
                    )
                }}
            </Motion>
        )

}

function CharSpinners(props) {
    let abbreviated = props.num.length > 70 ? "Entry: " + props.num.substr(0, 30) + "..." : props.num
    let spinners = abbreviated.split('').map((alphabet, i) => <AlphabetSpinner key={i} alphabet={alphabet} />)
    return (
        <div className="holder">{spinners}</div>
    );
}

function App() {
    const [stdOut, setStdOut] = useState('KeepHelper: Random Beacon');
    const [address, setAddress] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [randomBeacon, setRandomBeacon] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const [showRequestInfo, setShowRequestInfo] = useState(false);
    const [entryFee, setEntryFee] = useState(null);
    const [oldEntries, setOldEntries] = useState([]);
    const [collapsed, setCollapsed] = useState(true);
    const [noEthError, setNoEthError] = useState(false)

    useEffect( () => {
        const fetchData = async () => {
            try {
                await window.ethereum.enable();
                await getData(setError, setAddress, setRandomBeacon, requestId, setStdOut, setTxHash, setEntryFee, setLoading, setOldEntries)
            } catch(e) {
                setNoEthError(true)
                setStdOut('Please install MetaMask')
            }

        }
        fetchData();
    }, [stdOut, requestId]);

    const requestRelayEntry = async (e) => {
        setShowRequestInfo(false)
        e.preventDefault();
        setLoading(true);
        setStdOut('Waiting for request to be accepted by the Beacon...');

        try {
            let request = await randomBeacon.methods.requestRelayEntry().send({from: address, value: entryFee});
            let requestId = request.events.RelayEntryRequested.returnValues.requestId;
            setStdOut('Waiting for your entry to be generated...');
            setShowRequestInfo(true);
            setRequestId(requestId);
            setTxHash(request.events.RelayEntryRequested.transactionHash);
        } catch (e) {
            if (e.code) {
                setStdOut(e.message.substr(0, 50) + "...");
                setLoading(false);
            } else {
                try {
                    let err = e.toString();
                    let errorObject = JSON.parse(err.substring(err.indexOf('{'), err.lastIndexOf('}') + 1));
                    let reason = await getRevertReason(errorObject.transactionHash, "ropsten");
                    reason = "Error: \"" + reason.toString() + "\". Please try again."
                    setStdOut(reason.substr(0, 50) + "...");
                    setLoading(false);
                } catch (e2) {
                    setStdOut("Error: Unknown error. Please try again.");
                    setLoading(false);
                }

            }
        }

    };

    const onCollapse = collapsed => {
       setCollapsed(collapsed);
    };

    return (
        <Layout style={{height:'100%'}}>
        <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
            <div className="logo" />
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                <Menu.Item key="1" icon={<NumberOutlined />}>
                    RandomBeacon
                </Menu.Item>
            </Menu>
        </Sider>
        <div style={{textAlign: 'center', width: '100%', height: '100%', marginTop: '8rem'}}>
            {!loading && <img src={keepLogo} width={350} style={{marginBottom: '4rem'}} />}
            {loading && <img src={loadingSpinner} width={350} style={{marginBottom: '4rem', zIndex: 2147483647}} />}
            <div className="bits" style={{marginBottom: '4rem'}}>
            <CharSpinners num={stdOut}/>
        </div>
        <Controls showRequestInfo={showRequestInfo} requestRelayEntry={requestRelayEntry} requestId={requestId} txHash={txHash} entryFee={entryFee} oldEntries={oldEntries} noEthError={noEthError}/>
        </div>
        </Layout>
    );
}

function Controls(props) {
    const [visible, setVisible] = useState(false);

    const columns = [
        {
            title: 'Request Id',
            dataIndex: 'request_id',
            key: 'request_id',
        },
        {
            title: 'Entry',
            dataIndex: 'entry',
            key: 'entry',
        },
        {
            title: 'Transactions',
            key: 'links',
            dataIndex: 'links',
            render: (links) => {
                return (
                    <>
                        <Tag color={'geekblue'} key={links.requested}>
                            <a target={'_blank'} href={'https://ropsten.etherscan.io/tx/' + links.requested}>REQUESTED</a>
                        </Tag>
                        <Tag color={'green'} key={links.generated}>
                            <a target={'_blank'} href={'https://ropsten.etherscan.io/tx/' + links.generated}>GENERATED</a>
                        </Tag>
                    </>
                )
            },
        },
    ];

    const tableData = props.oldEntries.map((entry, i) => {
        return {key: i+1, request_id: entry.request.returnValues.requestId, entry: entry.generation.returnValues.entry, links: {generated: entry.generation.transactionHash, requested: entry.request.transactionHash}}
    })


    return  (

            <div className="bit-inputs" style={{display: props.noEthError ? 'none' : 'block'}}>

                <Button className={'btn-primary'} onClick={props.requestRelayEntry}>Request Entry</Button>
                <Button className={'btn-primary'} onClick={() => setVisible(true)}>View Old Entries</Button>
                <div style={{textAlign: 'center', paddingTop: '1em'}}>
                    Fee estimate: {props.entryFee ? web3.utils.fromWei(props.entryFee) : "Checking..."}
                </div>
                <div style={{textAlign: 'center', display: props.showRequestInfo ? 'block' : 'none'}}>
                    <div>Request accepted! Request ID: {props.requestId}</div>
                    <div><a href={`https://ropsten.etherscan.io/tx/${props.txHash}`} target={"_blank"}>{props.txHash}</a></div>
                </div>


                <Modal
                    title="Previous entries (Last 10000 blocks)"
                    centered
                    visible={visible}
                    onOk={() => setVisible(false)}
                    onCancel={() => setVisible(false)}
                    footer={null}
                    width={1000}
                >
                    <Table columns={columns} dataSource={tableData} />
                </Modal>
            </div>
        );

}

async function getData(setError, setAddress, setRandomBeacon, requestId, setStdOut, setTxHash, setEntryFee, setLoading, setOldEntries) {

    let randomBeacon;
    let entryFee;
    let Web3;

    const accounts = await Network.getAccounts();
    const yourAddress = accounts[0];

    try {
        [randomBeacon, Web3] = await getKeepRandomBeaconImplementation(process.env.REACT_APP_RANDOM_BEACON_CONTRACT_ADDRESS);
        entryFee = await randomBeacon.methods.entryFeeEstimate(0).call();
        let generationEvents = await randomBeacon.getPastEvents("RelayEntryGenerated",  {
            fromBlock: await Web3.eth.getBlockNumber() - 10000,
            toBlock: 'latest'
        })
        let requestEvents = await randomBeacon.getPastEvents("RelayEntryRequested",  {
            fromBlock: await Web3.eth.getBlockNumber() - 10000,
            toBlock: 'latest'
        })
        let rv = []
        for (let i = 0; i < requestEvents.length; i++) {
            if (generationEvents[i].returnValues.requestId === requestEvents[i].returnValues.requestId) {
                rv.push({generation: generationEvents[i], request: requestEvents[i]})
                if (rv.length >= generationEvents.length) {
                    break
                }
            }
        }
        setOldEntries(rv)
    } catch (e) {
        console.log(e);
        setError(true)
    }

    if (randomBeacon) {
        randomBeacon.events.RelayEntryGenerated(null, (error, event) => {
            if (event.returnValues.requestId === requestId) {
                setStdOut(event.returnValues.entry);
                setTxHash(event.transactionHash);
                setLoading(false);
            }
        });
    }

    setEntryFee(entryFee);
    setAddress(yourAddress);
    setRandomBeacon(randomBeacon);
}

export default App;
