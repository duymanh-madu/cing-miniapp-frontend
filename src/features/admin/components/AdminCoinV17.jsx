import {useCallback,useEffect,useState} from 'react';
import apiClient from '@/infra/api/apiClient';
import {collectCoinCsvV17} from './adminCoinCsvV17.js';
import './AdminCoinVisualV17.css';

const fmt=new Intl.NumberFormat('vi-VN');

function number(value){
  const n=Number(value);
  return Number.isSafeInteger(n)?fmt.format(n):'Không xác định';
}

function reportError(error){
  const status=error?.response?.status;
  if(status===401||status===403)return 'Không có quyền xem báo cáo.';
  return 'Báo cáo Coin chưa sẵn sàng. Kiểm tra migration và quyền truy cập.';
}

export default function AdminCoinV17({token,embedded=false}){
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [filters,setFilters]=useState({from:'',to:''});
  const [report,setReport]=useState(null);
  const [rows,setRows]=useState([]);
  const [cursor,setCursor]=useState(null);
  const [busy,setBusy]=useState(false);
  const [exporting,setExporting]=useState(false);
  const [exportProgress,setExportProgress]=useState(null);
  const [error,setError]=useState('');

  const load=useCallback(async(nextCursor=null,append=false)=>{
    if(!token)return;
    setBusy(true);
    setError('');
    try{
      const params={limit:'50'};
      if(filters.from)params.from=new Date(filters.from).toISOString();
      if(filters.to)params.to=new Date(filters.to).toISOString();
      if(nextCursor)params.cursor=nextCursor;

      const response=await apiClient.get('/admin/wallet/coin-report',{
        headers:{Authorization:`Bearer ${token}`},
        params
      });
      const value=response.data?.data;
      if(!value||!Array.isArray(value.items))throw new Error('Invalid report');

      setReport(value);
      setRows(previous=>append?[...previous,...value.items]:value.items);
      setCursor(value.nextCursor||null);
    }catch(e){
      setError(reportError(e));
      if(!append){setReport(null);setRows([]);setCursor(null);}
    }finally{
      setBusy(false);
    }
  },[token,filters]);

  useEffect(()=>{void load();},[load]);

  async function exportAllCsv(){
    if(exporting)return;

    setExporting(true);
    setExportProgress(null);
    setError('');

    try{
      const result=await collectCoinCsvV17({
        from:filters.from,
        to:filters.to,
        getPage:async params=>{
          const response=await apiClient.get(
            '/admin/wallet/coin-report',{
              headers:{Authorization:`Bearer ${token}`},
              params
            }
          );

          return response.data?.data;
        },
        onProgress:setExportProgress
      });

      const blob=new Blob([result.csv],{
        type:'text/csv;charset=utf-8'
      });

      const url=URL.createObjectURL(blob);
      const anchor=document.createElement('a');

      anchor.href=url;
      anchor.download=
        `cing-coin-${result.snapshotTo.slice(0,10)}-${result.rows}.csv`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(()=>URL.revokeObjectURL(url),30000);
    }catch(error){
      setError(
        'Xuất CSV chưa hoàn chỉnh, không tạo file: '+
        (error?.message||'Không xác định')
      );
    }finally{
      setExporting(false);
    }
  }

  const cards=[
    ['Tiền khách nạp Wallet trong kỳ (VNĐ)',
      report?.walletFlowsPeriod?.walletTopupRealVnd],
    ['Thưởng khuyến mại Wallet trong kỳ (VNĐ)',
      report?.walletFlowsPeriod?.walletPromotionBonusVnd],
    ['Coin đã phát hành',report?.lifetime?.issued],
    ['Coin đã tiêu dùng',report?.lifetime?.spent],
    ['Coin đang lưu hành',report?.outstanding?.coins],
    ['Coin nạp trong kỳ',report?.period?.issued],
    ['Coin tiêu trong kỳ',report?.period?.spent],
    ['Giá trị chuyển Wallet → Coin trong kỳ (VNĐ)',
      report?.period?.convertedVnd],
    ['Wallet thanh toán mua Coin trong kỳ (VNĐ)',
      report?.walletFlowsPeriod?.coinWalletPaymentsVnd],
    ['Thanh toán Wallet khác — tổng trước phân loại (VNĐ)',
      report?.walletFlowsPeriod?.otherWalletPaymentsVnd],
    ['Đơn app đã xác minh thanh toán (VNĐ)',
      report?.walletFlowsPeriod?.orderPaymentsVerifiedVnd],
    ['POS đã ghi nhận thanh toán (VNĐ)',
      report?.walletFlowsPeriod?.posPaymentsVerifiedVnd],
    ['Thanh toán Game Center (VNĐ)',
      report?.walletFlowsPeriod?.gamePaymentsVnd],
    ['Khoản khác chưa xác minh (VNĐ)',
      report?.walletFlowsPeriod?.unclassifiedPaymentsVnd]
  ];

  return <section className="cing-admin-coin-v17"
    style={{padding:embedded?12:20}}>
    <h2>Cing Coin · Báo cáo quản trị</h2>
    <p style={{fontSize:13}}>
      Tiền nạp Wallet, tiền thưởng khuyến mại, thanh toán
      đồ uống và giá trị chuyển sang Coin là các dòng tiền
      khác nhau. Không cộng trùng các dòng tiền này.
      Tình trạng xuất hóa đơn VAT cần được xác minh riêng.
    </p>

    <form onSubmit={event=>{
      event.preventDefault();
      setFilters({
        from:from?new Date(from).toISOString():'',
        to:to?new Date(to).toISOString():''
      });
    }} style={{display:'flex',gap:10,flexWrap:'wrap',margin:'16px 0'}}>
      <label>Từ <input type="datetime-local" value={from}
        onChange={e=>setFrom(e.target.value)}/></label>
      <label>Đến <input type="datetime-local" value={to}
        onChange={e=>setTo(e.target.value)}/></label>
      <button type="submit">Lọc thời gian</button>
      <button type="button" onClick={()=>void load()}
        disabled={busy||exporting}>Làm mới</button>
      <button type="button" onClick={()=>void exportAllCsv()}
        disabled={busy||exporting}>
        {exporting?'Đang đối soát CSV…':'Xuất CSV đầy đủ'}
      </button>
    </form>

    {error&&<p role="alert">{error}</p>}
    {exporting&&exportProgress&&
      <p role="status">
        Đã đối soát {number(exportProgress.loaded)}
        /{number(exportProgress.expected)} giao dịch để xuất CSV.
      </p>}
    {busy&&<p role="status">Đang tải dữ liệu…</p>}

    {report&&<>
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
        gap:12
      }}>
        {cards.map(([label,value])=><article key={label}
          style={{
            background:'#fff7ee',border:'1px solid #dfc3a7',
            borderRadius:12,padding:14
          }}>
          <div style={{fontSize:12}}>{label}</div>
          <strong style={{fontSize:21}}>
            {number(value)}
          </strong>
        </article>)}
      </div>

      <p role="status" style={{marginTop:14}}>
        Đối soát Coin Ledger / Coin Accounts:
        {' '}
        <strong>
          {report.outstanding?.balanced?'KHỚP':'CHÊNH LỆCH — CẦN KIỂM TRA'}
        </strong>
        {' '}· Chênh lệch: {number(report.outstanding?.delta)} Coin.
      </p>

      <p role="status" style={{fontSize:13}}>
        Đối soát Wallet ↔ Coin:
        {' '}
        <strong>
          {report.walletReconciliation?.status==='MATCHED'
            ?'KHỚP HAI CHIỀU'
            :'CHÊNH LỆCH — CẦN KIỂM TRA'}
        </strong>
        {' '}· Thiếu giao dịch Wallet:
        {' '}{number(report.walletReconciliation?.missingWalletTransactions)}
        {' '}· Wallet không có Coin:
        {' '}{number(report.walletReconciliation?.orphanWalletTransactions)}
        {' '}· Sai loại hoặc số tiền:
        {' '}{number(report.walletReconciliation?.mismatchedWalletTransactions)}
      </p>
      <p style={{fontSize:12}}>
        Dòng tiền đã tách theo nguồn giao dịch có bằng chứng.
        Đơn app và POS chưa đồng nghĩa đã có hóa đơn VAT iPOS.
        Khoản chưa xác minh luôn được giữ riêng.
        Đây là báo cáo đối soát, chưa phải kết luận nghĩa vụ thuế.
      </p>

      <div style={{overflowX:'auto',marginTop:16}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>
            <th>Thời điểm</th>
            <th>Nghiệp vụ</th>
            <th>Biến động Coin</th>
            <th>Giá trị VNĐ</th>
          </tr></thead>
          <tbody>
            {rows.map(row=><tr key={row.id}>
              <td>{new Date(row.created_at).toLocaleString('vi-VN')}</td>
              <td>{row.operation}</td>
              <td>{number(row.coin_delta)}</td>
              <td>{number(row.price_vnd)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>

      {cursor&&<button
        disabled={busy}
        onClick={()=>void load(cursor,true)}
        style={{marginTop:12}}>
        Xem thêm giao dịch
      </button>}
    </>}
  </section>;
}
