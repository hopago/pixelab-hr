# 양식(YAML) 작성 가이드

픽셀랩 HR의 모든 양식은 이 디렉토리의 YAML 파일로 정의합니다. `npm run sync-forms`를 실행하면 각 YAML이 `form_versions` 테이블의 한 행으로 등록되고, 그 시점부터 발급되는 응답 링크는 그 버전을 가리킵니다.

## 디렉토리 구조

```
forms/
├── diag-culture-16q/        ← slug
│   ├── v1.yaml             ← (구버전, 보존)
│   └── v2.yaml             ← (현재 버전)
├── form-1on1-30d/
│   └── v2.yaml
└── README.md               ← 이 문서
```

- 디렉토리명 = `slug` (URL 친화적 소문자 + 하이픈)
- 파일명 = `v{N}.yaml` (정수 버전 — 1, 2, 3 ...)

## 새 버전 발행

1. 양식 디렉토리에 `v{N+1}.yaml` 파일을 새로 만든다 (기존 파일은 절대 수정하지 않는다 — 응답 무결성을 위해)
2. `version: N+1` 필드를 새 값으로 갱신
3. `npm run sync-forms` 실행 → DB에 새 버전 row 추가됨
4. 이전에 발급된 응답 링크는 옛 버전으로, 그 이후 발급되는 링크는 새 버전으로 응답을 받는다

## 글자만 살짝 고치는 경우(같은 버전 안에서)

오타 수정처럼 의미가 안 변하는 변경은 **같은 파일을 그대로 덮어써도** 됩니다 — `sync-forms` 가 hash 변화를 감지해 같은 row 의 `schema_json`만 갱신합니다. **단, 이미 응답이 들어온 상태에서 글자를 바꾸면 응답 시점의 박제(`schema_snapshot_json`) 와 현재 양식 사이에 차이가 생기지만**, 응답 상세 페이지는 박제를 우선 보여주므로 옛 응답의 해석은 안전합니다.

## 카피 톤 (DDS v2.0 카피 가이드 발췌)

세 가지 규칙:
1. **한자어를 풀어 씁니다.** "본 양식은" → "이 종이는", "기재할 것" → "적어 주세요"
2. **명령형 대신 청유형을 씁니다.** "확인하라" → "확인해 주세요"
3. **이모지·느낌표는 쓰지 않습니다.** 친절은 단어 선택으로 만들지, 기호로 만들지 않습니다.

피해야 할 톤:
> "본 양식은 신규 입사자에 대한 30일 시점의 1:1 면담 결과를 기록하기 위함이며, 직속 상사가 작성함을 원칙으로 한다."

권장 톤:
> "입사 한 달이 지났습니다. 팀장님과 30분 동안 이야기를 나누고, 그 내용을 이 종이에 정리해 주세요."

## 스키마 필드

```yaml
doc_id: DIAG-CULTURE-16Q          # 사람이 읽는 문서 ID
slug: diag-culture-16q            # URL 슬러그
name: 조직문화 16문항 자가 진단    # 사람이 읽는 이름
category: culture                 # culture | onboarding | interview-q | interview-eval | exit
version: 2                        # 정수
date: "2026-05-10"                # YYYY-MM-DD
anonymous: true                   # 익명이면 IP/UA/email 미수집
retention: "RETENTION 3Y"         # (선택) 보존 정책 표시 텍스트

intro:
  eyebrow: "..."                  # (선택) 모노폰트 작은 윗줄
  title: "..."                    # 큰 제목 — \n 으로 줄바꿈
  lede: "..."                     # (선택) 부제. **bold** 인라인 강조 가능

bignum:                           # (선택) 3개 권장
  - { value: "16",   label: "Questions" }
  - { value: "7",    label: "Minutes" }
  - { value: "100%", label: "Anonymous" }

topCallout:                       # (선택) 본문 시작 전 안내 박스
  label: "답하시기 전에"
  body: "..."

topMeta:                          # (선택) 응답자 메타 입력
  - { id: dept,   label: "소속" }
  - { id: tenure, label: "재직 기간" }
  - { id: date,   label: "응답일", fieldType: date }

topAnchorBar:                     # (선택) Likert 양식에서 본문 위 anchor
  type: anchor-bar
  left: "1 · 전혀 아니다"
  right: "매우 그렇다 · 5"

blocks:                           # 본문 블록들 — 순서대로 렌더링
  - type: ...

outroCallout:                     # (선택) 본문 끝 안내 박스
  label: "다 적으셨다면"
  body: "..."

footer:                           # (선택) 푸터 좌/우
  left:  "DIAG-CULTURE-16Q · v2.0"
  right: "ANONYMOUS"
```

## 블록 타입

### 1. `section-head` — 섹션 구분
```yaml
- type: section-head
  num: A                # A, B, ...
  title: "먼저, 본인 이야기를 들려주세요"
  aside: "25 MIN"       # (선택) 우측 작은 텍스트
```

### 2. `field-text` — 단답
```yaml
- type: field-text
  id: name              # 응답 키 (DB 에 저장됨)
  num: A1               # (선택) 표시용 번호
  title: "성함을 적어 주세요"
  help: "한글 정자로."  # (선택)
  placeholder: "예) 윤수현"
  required: false
```

### 3. `field-textarea` — 서술형
```yaml
- type: field-textarea
  id: A1
  num: A1
  title: "지난 30일 중 가장 잘 풀렸던 일과 가장 막혔던 일을 한 가지씩 적어 주세요"
  help: "큰 일이 아니어도 됩니다. 작지만 기억에 남는 순간이면 충분합니다."
  placeholder: "잘 풀린 일 / 막힌 일을 각각 한 줄씩이라도."
```

### 4. `radio-group` — 단일 선택
```yaml
- type: radio-group
  id: B3
  num: B3
  title: "가장 강하게 느껴진 양식을 하나 골라 주세요"
  help: "..."
  horizontal: true
  options:
    - { value: caring,   label: "배려" }
    - { value: purpose,  label: "목표" }
    # ...
```

### 5. `check-group` — 다중 선택
값(`value`)에 `rights_negotiation` / `gossip` / `accountability` / `leaving_intent` / `comp_query` / `conflict` / `other` 를 사용하면, 응답 시점에 자동으로 **리텐션 신호**로 등록됩니다(링크가 직원과 연결된 경우). 이 외 값은 단순 응답으로만 저장됩니다.

```yaml
- type: check-group
  id: B4
  num: B4
  title: "적응이 어려운 신호가 보이나요"
  help: "..."
  options:
    - { value: rights_negotiation, label: "..." }
    - { value: gossip,             label: "..." }
    - { value: accountability,     label: "..." }
    - { value: none,               label: "해당 없음" }
```

### 6. `likert-cluster` — 5점 척도 묶음 (조직문화 진단용)
```yaml
- type: likert-cluster
  tag: A
  name: 배려
  keywords: "Caring · 따뜻함 / 협동 / 신뢰"
  questions:
    - { id: A1, text: "..." }
    - { id: A2, text: "..." }
```
8양식(A~H) 구성 시 자동으로 `/admin/culture` 대시보드에서 양식별 평균/편차로 시각화됩니다.

### 7. `callout` — 안내 박스 (본문 중간)
```yaml
- type: callout
  label: "한 가지만 정합니다"
  body: "..."
```

### 8. `paragraph` — 본문 단락
```yaml
- type: paragraph
  text: "..." # **bold** 인라인 강조 가능
```

### 9. `table` — 표
```yaml
- type: table
  columns:
    - { header: "상황", width: "32%" }
    - { header: "해당하면 인사에 알려 주세요" }
  rows:
    - ["바로 알리기", "적응 신호 한 가지라도 체크된 경우, 또는 ..."]
    - ["이번 주 안에", "..."]
    - ["월 보고로 충분", "..."]
```
첫 컬럼이 "바로 알리기" / "이번 주 안에" / "월 보고로 충분" 세 문자열 중 하나면 자동으로 색 점이 그려집니다.

### 10. `meta-grid` — 표 형태 메타 입력 (본문 중간)
서명·일자처럼 본문 끝에 두는 메타 입력에 사용. `id`가 있으면 입력 필드가 됩니다.
```yaml
- type: meta-grid
  columns: 2
  cells:
    - { id: lead_sign, label: "팀장님 서명 / 일자",  fieldType: signature }
    - { id: hr_sign,   label: "인사 수령 확인",      fieldType: signature }
```

### 11. `anchor-bar` — Likert anchor (본문 중간 추가)
보통 `topAnchorBar`로 처리하면 충분하지만, 본문 중간에 다시 넣고 싶을 때 사용.

## 검증

YAML 작성 후 `npm run sync-forms` 가 Zod 검증에 실패하면 등록되지 않습니다. 메시지를 보고 필드를 고쳐 주세요.

미리보기는 인증 없이 `/preview/{slug}` 에서 확인할 수 있습니다 — 이 경로는 가장 최신 버전의 YAML 을 즉시 렌더링합니다.
