// src/components/ComponentShowcase.jsx
import { useState } from 'react';
import { Button, Input, Card, Badge } from '../shared/ui';
import './ComponentShowcase.css';

function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    if (value.length < 3) {
      setInputError('至少需要3個字元');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="showcase">
      <div className="showcase__header">
        <h1>M&A Platform UI 組件庫</h1>
        <p>展示所有可用的 UI 組件和它們的不同狀態</p>
      </div>

      {/* Button 組件展示 */}
      <section className="showcase__section">
        <Card title="Button 組件" subtitle="各種按鈕變體和狀態">
          <div className="showcase__group">
            <h4>基本變體</h4>
            <div className="showcase__buttons">
              <Button variant="primary">主要按鈕</Button>
              <Button variant="secondary">次要按鈕</Button>
              <Button variant="success">成功按鈕</Button>
              <Button variant="warning">警告按鈕</Button>
              <Button variant="danger">危險按鈕</Button>
              <Button variant="ghost">幽靈按鈕</Button>
            </div>
          </div>

          <div className="showcase__group">
            <h4>尺寸變體</h4>
            <div className="showcase__buttons">
              <Button size="small">小按鈕</Button>
              <Button size="medium">中按鈕</Button>
              <Button size="large">大按鈕</Button>
            </div>
          </div>

          <div className="showcase__group">
            <h4>狀態變體</h4>
            <div className="showcase__buttons">
              <Button onClick={handleTestLoading}>正常狀態</Button>
              <Button loading={loading}>
                {loading ? '載入中...' : '測試載入'}
              </Button>
              <Button disabled>禁用狀態</Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Input 組件展示 */}
      <section className="showcase__section">
        <Card title="Input 組件" subtitle="各種輸入框類型和狀態">
          <div className="showcase__grid">
            <Input
              label="基本輸入框"
              placeholder="請輸入內容"
              value={inputValue}
              onChange={handleInputChange}
              error={inputError}
            />
            
            <Input
              label="Email 輸入框"
              type="email"
              placeholder="請輸入 Email"
              required
            />
            
            <Input
              label="密碼輸入框"
              type="password"
              placeholder="請輸入密碼"
              required
            />
            
            <Input
              label="禁用狀態"
              value="無法編輯"
              disabled
            />
            
            <Input
              label="帶圖標"
              placeholder="搜尋..."
              icon="🔍"
            />
            
            <Input
              label="錯誤狀態"
              value="錯誤的輸入"
              error="這是一個錯誤訊息"
            />
          </div>
        </Card>
      </section>

      {/* Badge 組件展示 */}
      <section className="showcase__section">
        <Card title="Badge 組件" subtitle="狀態徽章和標籤">
          <div className="showcase__group">
            <h4>Proposal 狀態</h4>
            <div className="showcase__badges">
              <Badge status="draft" />
              <Badge status="under_review" />
              <Badge status="approved" />
              <Badge status="rejected" />
              <Badge status="archived" />
            </div>
          </div>

          <div className="showcase__group">
            <h4>Case 狀態</h4>
            <div className="showcase__badges">
              <Badge status="created" />
              <Badge status="interested" />
              <Badge status="nda_signed" />
              <Badge status="in_negotiation" />
              <Badge status="completed" />
              <Badge status="cancelled" />
            </div>
          </div>

          <div className="showcase__group">
            <h4>用戶角色</h4>
            <div className="showcase__badges">
              <Badge status="admin" />
              <Badge status="buyer" />
              <Badge status="seller" />
            </div>
          </div>

          <div className="showcase__group">
            <h4>尺寸和點狀徽章</h4>
            <div className="showcase__badges">
              <Badge variant="primary" size="small">小徽章</Badge>
              <Badge variant="success" size="medium">中徽章</Badge>
              <Badge variant="warning" size="large">大徽章</Badge>
              <Badge variant="danger" dot>帶點徽章</Badge>
            </div>
          </div>
        </Card>
      </section>

      {/* Card 組件展示 */}
      <section className="showcase__section">
        <Card title="Card 組件" subtitle="各種卡片變體和用法">
          <div className="showcase__grid">
            <Card variant="default" title="默認卡片" subtitle="這是一個默認的卡片">
              <p>這是卡片的內容區域。可以放置任何內容。</p>
            </Card>

            <Card 
              variant="primary" 
              title="主色卡片" 
              subtitle="帶有主色邊框"
              hoverable
            >
              <p>這是一個可懸停的主色卡片。滑鼠懸停時會有動畫效果。</p>
            </Card>

            <Card 
              variant="success" 
              title="成功卡片"
              clickable
              onClick={() => alert('卡片被點擊了！')}
            >
              <p>這是一個可點擊的成功卡片。點擊試試看！</p>
            </Card>

            <Card 
              title="帶操作的卡片"
              headerAction={
                <Badge status="approved" />
              }
              footer={
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="small" variant="primary">編輯</Button>
                  <Button size="small" variant="danger">刪除</Button>
                </div>
              }
            >
              <p>這個卡片有頭部操作和底部按鈕。</p>
            </Card>
          </div>
        </Card>
      </section>

      {/* 綜合示例 */}
      <section className="showcase__section">
        <Card title="綜合示例" subtitle="模擬真實的 Proposal 卡片">
          <Card 
            variant="default"
            title="科技公司併購案"
            subtitle="AI 領域的新創公司"
            hoverable
            headerAction={<Badge status="approved" />}
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge variant="info" size="small">科技</Badge>
                  <Badge variant="success" size="small">AI</Badge>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="small" variant="primary">查看詳情</Button>
                  <Button size="small" variant="secondary">表達興趣</Button>
                </div>
              </div>
            }
          >
            <p><strong>簡介：</strong>專注於機器學習和自然語言處理的新創公司，具有強大的技術團隊和創新的產品線。</p>
            <p><strong>成立時間：</strong>2020年</p>
            <p><strong>員工數：</strong>50-100人</p>
            <p><strong>預估價值：</strong>$10M - $50M</p>
          </Card>
        </Card>
      </section>
    </div>
  );
}

export default ComponentShowcase;