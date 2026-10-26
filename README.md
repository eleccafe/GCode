# GCode

모바일·태블릿 연습용 기타 코드 뷰어. React 18, TypeScript, Vite, Tailwind, 자체 SVG, Web Audio, PWA로 구성한 서버 없는 앱입니다.

## 실행

Node.js 22 이상을 사용합니다. Windows PowerShell의 실행 정책이 npm.ps1을 막는 경우 `npm.cmd`를 사용하세요.

```powershell
npm.cmd install
npm.cmd run dev
```

개발 서버: http://127.0.0.1:5173

```powershell
npm.cmd test
npx.cmd playwright install chromium
npm.cmd run test:e2e
npm.cmd run build
npm.cmd run check:size
npm.cmd run preview
```

PWA 서비스 워커는 프로덕션 빌드에서 활성화됩니다. `preview`로 접속한 뒤 **오프라인 준비됨** 상태를 확인하고 네트워크를 끊어 재방문하세요. 개발 서버에서는 서비스 워커를 등록하지 않습니다.

## 구현 기능

- 코드 파싱/정규화, 자동완성, 오류 후보 3개, 코드 전용 키패드
- 12개 루트 × 12개 성질 = 144개 코드, 295개 운지. 이명동음 조회 지원
- 큰 SVG 운지표, 근음 강조, 손가락 번호, 뮤트/개방현, 바레, 프렛 위치
- 운지 버튼 및 좌우 스와이프, 관련 코드 3개 그룹, 키 고정
- 최근 코드 10개, URL 쿼리와 브라우저 뒤로/앞으로 이동
- 왼손잡이/가로 방향/음이름/다크 모드, 기기 내 설정 저장
- Karplus–Strong 스트럼, SVG 다운로드, 키보드 탐색, 접근성 설명
- PWA 사전 캐시, GitHub Pages Actions 구성

같은 키와 대리 진행의 음 이름은 키의 철자를 따릅니다. 설정의 샤프/플랫 우선은 구성음 및 운지표 내부 음이름에 적용됩니다. `G/B`는 실제 최저음이 B인 운지를 고릅니다. 현재 데이터에서 해당 베이스 운지를 만들 수 없는 슬래시 코드는 구성음과 관련 코드를 보여 주며 운지 미지원 안내를 표시합니다.

## 데이터 출처와 재생성

현재 포함한 `src/data/chords.json`은 직접 정의한 표준 E/A 이동형 운지와 익숙한 오픈 운지에서 생성했습니다. 외부 코드 DB의 자료를 복제하지 않았습니다. 외부 네트워크 제한으로 npm DB를 다운로드하지 못해 이 방식을 사용했습니다.

```powershell
npm.cmd run data:generate
```

`scripts/import-chords.mjs`는 대체 데이터 소스로 [tombatossals/chords-db](https://github.com/tombatossals/chords-db)의 npm 0.5.1 데이터를 변환합니다. 패키지 설치 후 `npm.cmd run data:import`로 실행할 수 있습니다. 상대 프렛을 절대 프렛으로 바꾸고, 빠지거나 틀린 구성음·잘못된 손가락 번호를 필터링합니다. 외부 데이터 교체 후 반드시 전체 테스트를 실행하세요. MIT 원문 저작권 고지는 변환 시 `public/THIRD_PARTY_LICENSES.txt`에 복사됩니다. 현재 생성 데이터에는 외부 라이선스가 적용된다고 표시하지 않습니다.

`frets`는 6번줄부터 1번줄까지 **절대 프렛**입니다. -1은 뮤트, 0은 개방. 바레의 `from`과 `to`는 줄 번호입니다. Bm처럼 낮은 프렛의 이동형 바레는 데이터의 `baseFret`을 우선하여 `2fr`를 표시합니다.

## 구조

```text
src/theory/       파싱, 음 이름, 구성음, 관련 코드의 순수 함수 및 테스트
src/data/         운지 JSON, 이명동음/슬래시 베이스 조회 및 검증 테스트
src/components/   입력, SVG, 관련 코드, 설정
src/hooks/        URL·히스토리·저장 동기화
src/audio.ts      Karplus–Strong 합성
e2e/              입력/이동/설정/스와이프/오프라인 Playwright 테스트
scripts/          데이터 생성·변환, 독립 검증, 번들 크기 검사
```

## 검증 상태

의존성 설치 후 TypeScript 전체 타입 검사와 Vite 프로덕션 빌드를 통과했습니다. 단위 테스트 54개가 통과했고 이론 모듈의 lines/functions/branches/statements 커버리지는 모두 100%입니다.

GitHub Pages와 같은 `/GCode/` 경로로 빌드한 결과를 로컬 Chrome에서 검증했습니다. 데스크톱·360px 모바일 Playwright 테스트 12개가 통과했으며 입력, 코드 전환, 뒤로 가기, 설정 저장, 스와이프, 오프라인 재방문, 배포 경로 안의 JavaScript 및 서비스 워커 범위를 포함합니다. 전체 오프라인 앱의 gzip 합계는 76.5 KiB입니다. 실제 GitHub Pages 게시 결과, 홈 화면 설치와 100ms 응답 지연은 별도 확인이 필요합니다.

외부 의존성이 필요 없는 Node.js 검증은 실행 가능합니다(Node 22.13+):

```powershell
npm.cmd run test:offline
```

이 검증은 실제 TypeScript 이론 코드를 Node의 타입 제거 기능으로 실행합니다. 144개 코드와 모든 보이싱의 음 구성, 손가락 번호, 바레 장애물, 프렛 범위, 입력 정규화, 관련 코드 정렬 및 키별 철자, 슬래시 코드의 실제 베이스음을 검사합니다. 이는 브라우저 테스트나 TypeScript 타입 검사를 대체하지 않습니다.

별도 TypeScript 컴파일러가 있다면 `node scripts/check-types-offline.mjs <typescript.js 절대 경로>`로 의존성 없이 문법 및 이론·데이터 타입 검사도 실행할 수 있습니다.

## 배포

GitHub 저장소에서 Settings → Pages → Source를 **GitHub Actions**로 지정하면 `main` 푸시 시 테스트와 빌드 후 배포합니다. `Deploy from a branch`로 소스 루트를 게시하지 마세요. 브라우저는 `src/main.tsx`를 직접 실행할 수 없습니다.

워크플로는 `npm ci`로 잠금 파일의 의존성을 설치하고, 프로젝트 배포 경로를 사용하여 E2E 테스트를 실행합니다. 테스트한 `dist`를 다시 빌드하지 않고 그대로 배포합니다. 테스트가 실패하면 배포되지 않으므로 Actions의 마지막 실행 결과를 확인하세요. 사용자/조직 루트 Pages 저장소는 workflow의 `VITE_BASE_PATH`를 `/`로 바꾸세요.

로컬에서 GitHub Pages 경로를 재현하려면:

```powershell
$env:VITE_BASE_PATH = '/GCode/'
npm.cmd run test:e2e
```

제한된 Windows 실행 환경에서 Vite 설정을 읽는 esbuild가 상위 디렉터리 접근 오류를 내면, Node 22.18+ 또는 24에서 `node node_modules/vite/bin/vite.js build --configLoader native`와 `node node_modules/vitest/vitest.mjs run --coverage --configLoader native`로 네이티브 설정 로더를 사용할 수 있습니다. GitHub Actions의 Linux 환경에서는 기본 명령을 사용합니다.

Vercel에서는 Vite 프리셋, 빌드 `npm run build`, 결과 폴더 `dist`, 기본 경로 `/`를 사용합니다. 별도 서버나 비밀 키는 필요하지 않습니다.
