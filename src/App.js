import './App.css';
import DiaryEditor from './DiaryEditor';
import DiaryList from './DiaryList';
import { useState, useRef, useEffect, useMemo } from 'react';
import OptimizeTest from './OptimizeTest';
// import Lifecycle from './Lifecycle';

function App() {
  const [data, setData] = useState([]); // 일기 없는 상태로 시작할거니까 빈배열, 일기상태변화함수 - setData

  // id 추가하는거 useRef 이용
  const dataId = useRef(0); // 초기값 0 설정

  // API를 호출하는 getData 함수
  // 원하는 json 값들만 뽑아서 가져옴 - fetch, async await 이용
  const getData = async () => {
    const res = await fetch(
      'https://jsonplaceholder.typicode.com/comments'
    ).then((res) => res.json());

    // 0~19까지 자르고 모든 배열 순회
    // 배열을 각각 순회해서 map함수의 콜백함수 안에서 리턴하는 값들을 모아 배열을 만들어 initData에 넣겠다
    const initData = res.slice(0, 20).map((it) => {
      return {
        author: it.email,
        content: it.body,
        emotion: Math.floor(Math.random() * 5) + 1,
        created_date: new Date().getTime(),
        id: dataId.current++,
      };
    });

    setData(initData); // 일기데이터 초기값 설정
  };

  // 컴포넌트 mount 시점에 API를 호출하는 getData를 전달해줌
  useEffect(() => {
    getData();
  }, []);

  const onCreate = (author, content, emotion) => {
    const created_date = new Date().getTime(); // 현재시간 구해버려
    // 새로운 일기아이템으로 추가해야 하는 것
    const newItem = {
      author,
      content,
      emotion,
      created_date,
      id: dataId.current,
    };
    dataId.current += 1; // 다음 일기 id는 1을 가져야 하니까 증가시킴
    setData([newItem, ...data]); // 원래 배열에 있던 데이터들을 하나하나 나열, 새로 추가할 일기 newItem은 위로 보내야하니까 먼저 씀
  };

  // 원본 data 삭제하는 함수
  // App 컴포넌트에서 직접 onDelete 호출하는 것이 아니기 때문에 어떤 아이디를 갖고있는 요소를 지우길 원하는지 매개변수로 받음 -> targetId
  const onRemove = (targetId) => {
    // console.log(`${targetId}가 삭제되었습니다`);
    const newDiaryList = data.filter((it) => it.id !== targetId); // 지금 클릭한거 제외하고 filter
    // console.log(newDiaryList);
    setData(newDiaryList);
  };

  // 매개변수로 뭘 어떻게 수정할지 받아와야 함
  const onEdit = (targetId, newContent) => {
    setData(
      data.map((it) =>
        it.id === targetId ? { ...it, content: newContent } : it
      )
    );
  };

  // 일기분석결과 함수. emotion: 1 -> 기분 안좋음, 5 -> 기분 좋음
  // useMemo 이용 - 연산의 최적화
  const getDiaryAnalysis = useMemo(() => {
    // console.log('일기 분석 시작');

    // 기분 세는 함수
    // 배열의 원소중에 emotion이 3 이상인것만 추려서 새로운 배열로 만들고, 그것들의 길이를 구함 => 기분 좋은 갯수
    const goodCount = data.filter((it) => it.emotion >= 3).length;
    const badCount = data.length - goodCount;
    const goodRatio = (goodCount / data.length) * 100;

    return { goodCount, badCount, goodRatio };
  }, [data.length]);

  // 지역함수로 만든 getDiaryAnalysis 리턴 전에 호출
  // 함수로 호출한거 객체로 반환됨, 똑같이 객체로 구조분해할당
  const { goodCount, badCount, goodRatio } = getDiaryAnalysis;

  return (
    <div className='App'>
      {/* <Lifecycle /> */}
      <OptimizeTest/>
      <DiaryEditor onCreate={onCreate} />
      <div>전체 일기 : {data.length}</div>
      <div>기분 좋은 일기 개수 : {goodCount}</div>
      <div>기분 나쁜 일기 개수 : {badCount}</div>
      <div>기분 좋은 일기 비율 : {goodRatio}</div>
      <DiaryList onEdit={onEdit} onRemove={onRemove} diaryList={data} />
    </div>
  );
}

export default App;
