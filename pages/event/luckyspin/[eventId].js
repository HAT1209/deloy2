import React, { useEffect, useState } from "react";
import Title from "public/shared/Title";
import { useMemo } from "react/cjs/react.development";
import Spin from "public/shared/Spin";
import CurrentEventDetail from "public/shared/CurrentEventDetail";
import OverlayBlock from "public/shared/OverlayBlock";
import LuckySpinSetting from "public/shared/LuckySpinSetting";
import RewardList from "public/shared/RewardList";
import router, { useRouter } from "next/router";
import { useUserPackageHook } from "public/redux/hooks";
import { usePlayerParticipantHook } from "public/redux/hooks";
// firebase
import { auth, db } from "../../../src/firebase";
import { getDatabase, ref, set, child, get, onValue, update, query, orderByChild, equalTo, push } from "firebase/database";
import PageLoading from "public/shared/PageLoading";


export default function LuckySpin() {
    const [loadedData, setLoadedData] = useState(false);

    const router = useRouter();
    // Mã event
    const EventID = router.query.eventId;
    // Thông tin người chơi
    const currPlayer = usePlayerParticipantHook();
    // Mã người chơi
    const participantId = currPlayer.participantId;
    
    // Event
    const [eventInfo, setEventInfo] = useState({})
        
    // Danh sách giải thưởng
    const [rewardList, setRewardList] = useState([]);
    // Index giải thưởng đang được chọn
    const [rewardChosing, setRewardChosing] = useState(0);
    // Danh sách phần quà còn lại
    const [remainRewardList, setRemainRewardList] = useState(rewardList);
    
    // Danh sách người chơi
    const [playerList, setPlayerList] = useState([]);
    // Danh sách người chơi quay thưởng
    const [remainPlayerList, setRemainPlayerList] = useState(playerList);
    // Danh sách người chơi được điều chỉnh
    const [editedPlayerList, setEditedPlayerList] = useState(remainPlayerList);
    // Danh sách người chơi dùng để hiển thị trên vòng quay
    const [playerShowList, setPlayerShowList] = useState(Object.values(playerList).slice(0, 9));
    
    // Đang quay thưởng
    const [spinClicked, setSpinClicked] = useState(false);
    // Người nhận thưởng
    const [lastAwardedIndex, setLastAwardedIndex] = useState(0);
    // ID người nhận thưởng
    const [lastAwardedId, setLastAwardedId] = useState("");
    // Số người chơi online
    const [onlinePlayerAmount, setOnlinePlayerAmount] = useState(0);

    // Firebase
    const dbRef = ref(db);

    // Link


    const fetchDB = () => {
        const que3 = query(ref(db, "event"), orderByChild("eventId"), equalTo(EventID));
        onValue(que3, (snapshot) => {
            if (snapshot.exists()) {
                const data = Object.values(snapshot.val())[0];
                if (data["status"] === 1) router.push('/');
                if (data["status"] === 2) router.push('/');
                if (data["status"] === 4) router.push('/event/event-result/' + EventID);
                setEventInfo(data);
                const rewardChosingIndex = data['playingData']['rewardChosingIndex'];
                const isSpining = data['playingData']['isSpinning'];
                const lastAwardedIndex = data['playingData']['lastAwardedIndex'];
                if (!spinClicked && isSpining) {
                    setLastAwardedIndex(lastAwardedIndex);
                    setSpinClicked(isSpining);
                };
                setRewardChosing(rewardChosingIndex);
            } else {
                router.push('/');
            }
        });

        const que1 = query(ref(db, "event_rewards"), orderByChild("eventId"), equalTo(EventID));
        onValue(que1, (snapshot) => {
            if (snapshot.exists()) {
                const data = Object.values(snapshot.val());
                data.sort(compare);
                setRewardList(data);
                setRemainRewardList(data.filter((val) => (val.quantityRemain > 0)));
            }
        });

        const que2 = query(ref(db, "event_participants"), orderByChild("eventId"), equalTo(EventID));
        onValue(que2, (snapshot) => {
            if (snapshot.exists()) {
                const rawData = snapshot.val();
                if (!Object.keys(rawData).includes(participantId)) router.push('/')
                const data = Object.values(rawData);
                data.forEach((val, idx) => {
                    val.ID = Object.keys(rawData)[idx];
                    get(child(ref(db), "users/" + val.participantId)).then((snapshot) => {
                        if (snapshot.exists()) {
                            val.pic = snapshot.val().pic;
                        }
                    })
                })
                setTimeout(function()
                {
                    const online = data.filter(val => val.status === 1).length;
                    const filted = data.filter(val => (val.idReward === "" && val.status === 1));
                    setPlayerList(rawData);
                    setRemainPlayerList(filted);
                    setOnlinePlayerAmount(online);
                }, 200);
            }
        });
        setTimeout(() => setLoadedData(true), 1500)
    }

    // ------------------------------------------------- Function
    function compare(a, b) {
        if (a.sortNo > b.sortNo) return 1;
        if (b.sortNo > a.sortNo) return -1;
        return 0;
    }

    const spining = () => {
        if (remainRewardList.length <= 0 || remainPlayerList.length <= 0) return;
        Array.from({length: 9}, (_, index) => index).forEach(idx => {
            document.getElementById("spin-idx-" + idx).classList.add("animate-move-down-"+idx)
        })
        
        const phase1 = setInterval(() => {
            setPlayerShowList((list) => [list.pop(), ...list]);
        }, 50);
        
        const timeoutPhase1 = setTimeout(() => {
            clearInterval(phase1);
            setPlayerShowList([...editedPlayerList, ...editedPlayerList, ...editedPlayerList].slice(lastAwardedIndex, lastAwardedIndex + 18))
            Array.from({length: 9}, (_, index) => index).forEach(idx => {
                document.getElementById("spin-idx-" + idx).classList.remove("animate-move-down-"+idx)
                document.getElementById("spin-idx-" + idx).classList.add("animate-slow-move-down-"+idx)
            })
                        
            const phase2 = setInterval(() => {
                setPlayerShowList((list) => [list.pop(), ...list]);
            }, 500);

            const timeoutPhase2 = setTimeout(() => {
                clearInterval(phase2);
                Array.from({length: 9}, (_, index) => index).forEach(idx => {
                    document.getElementById("spin-idx-" + idx).classList.remove("animate-slow-move-down-"+idx)
                })
                const timeoutPhase3 = setTimeout(() => {
                    document.getElementById("awardedOverlay").classList.remove('hidden');
                    document.getElementById("awaredPlayerName").innerHTML = remainPlayerList[lastAwardedIndex].nameDisplay;
                    document.getElementById("awaredRewardName").innerHTML = remainRewardList[rewardChosing].nameReward;
                    setSpinClicked(false);
                }, 1000)
            }, 2000)

        }, 1000)
    }

    const awardNotification = (
        <div className="flex flex-col items-center text-center text-[#004599]">
            <p className="font-semibold">Chúc mừng</p>
            <p className="font-[900] text-lg" id="awaredPlayerName"></p>
            <p className="font-semibold">đã nhận được giải:</p>
            <p className="font-[900] text-lg" id="awaredRewardName"></p>
        </div>
    )

    // ------------------------------------------------------------------------ UseEffect
    // Real time
    useEffect(() => {
        // Nếu đến trang trong trạng thái chưa đăng ký participant, đưa đến trang nhập thông tin
        if (participantId === "") router.push('/');

        fetchDB();
        
        const setOnlineStatus = (status) => {
            update(ref(db, 'event_participants/' + participantId),
                {
                    status: status
                });
            if (status === 2) clearInterval(onlineStatus);
        }

        const onlineStatus = setInterval(() => setOnlineStatus(1), 1000);
        window.addEventListener('beforeunload', () => setOnlineStatus(2));

        return () => {
            setOnlineStatus(2);
            window.removeEventListener('beforeunload', () => setOnlineStatus(2));
        }
    }, [])
    
    // Điều chỉnh danh sách người chơi được điều chỉnh
    useEffect(() => {
        // Làm đầy danh sách
        if (editedPlayerList.length === 0) {
            setPlayerShowList(editedPlayerList.slice(0, 9))
            return;
        };
        if (editedPlayerList.length < 9 && remainPlayerList.length < 9)
            setEditedPlayerList((list) => [...list, ...remainPlayerList]);
        else setPlayerShowList(editedPlayerList.slice(0, 9));
    }, [editedPlayerList])

    // Điều chỉnh danh sách người chơi quay thưởng
    useEffect(() => {
        setEditedPlayerList([...remainPlayerList]);
    }, [remainPlayerList])

    useEffect(() => {
        if (spinClicked) spining();
    }, [spinClicked])

    
    // ------------------------------------------------------------ useMemo
    const spinBlock = useMemo(() => {
        return <Spin listPlayer={playerShowList} />
    }, [playerShowList])

    const renderCurrEventDetail = useMemo(() => {
        return <CurrentEventDetail listPlayer={playerList} listReward={rewardList} remainReward={true}></CurrentEventDetail>
    }, [playerList, rewardList]);

    const renderSetting = useMemo(() => {
        return <OverlayBlock childDiv={<LuckySpinSetting router={router} />}  id={"settingOverlay"}></OverlayBlock>
    }, []);

    const renderAwardNotification = useMemo(() => {
        return <OverlayBlock childDiv={awardNotification}  id={"awardedOverlay"}></OverlayBlock>
    }, []);

    const renderRewardList = useMemo(() => {
        return <RewardList
                    listReward={remainRewardList.slice(rewardChosing, rewardChosing+1)}
                    showRemain={true}
                    showAwardedPaticipant={true}
                />
    }, [remainRewardList, rewardChosing])

    return (
        <>
        {loadedData?
            <section className="relative h-screen px-5 py-5 mx-auto flex justify-center items-center w-3/4 max-w-md max-sm:w-full">
                <div className="flex flex-col justify-start items-center w-full h-full">
                    <div className="flex flex-col w-full pt-5">
                        <Title title="QUAY THƯỞNG MAY MẮN" fontSize="24" fontWeight="semibold"/>
                        <Title title={eventInfo.title} fontSize="32" />
                        <div className="flex w-full justify-between -mt-3 mb-1">
                            <p className="font-[900] text-[#004599] text-[16px] text-left items-center h-6">Số người trực tuyến</p>
                            <span className="flex gap-1">
                                <p className="items-center text-center bg-[#3B88C3] text-white font-[900] rounded-md w-6 h-6">
                                    {Math.floor(onlinePlayerAmount/100)}
                                </p>
                                <p className="items-center text-center bg-[#3B88C3] text-white font-[900] rounded-md w-6 h-6">
                                    {Math.floor((onlinePlayerAmount%100)/10)}
                                </p>
                                <p className="items-center text-center bg-[#3B88C3] text-white font-[900] rounded-md w-6 h-6">
                                    {Math.floor((onlinePlayerAmount%100)%10)}
                                </p>
                            </span>
                        </div>
                        <div className="flex w-full justify-between">
                            <p className="font-[900] text-[#004599] text-[16px] text-left items-center h-6">Số người quay thưởng</p>
                            <span className="flex gap-1">
                                <p className="items-center text-center bg-[#3B88C3] text-white font-[900] rounded-md w-6 h-6">{Math.floor(remainPlayerList.length/100)}</p>
                                <p className="items-center text-center bg-[#3B88C3] text-white font-[900] rounded-md w-6 h-6">{Math.floor((remainPlayerList.length%100)/10)}</p>
                                <p className="items-center text-center bg-[#3B88C3] text-white font-[900] rounded-md w-6 h-6">{Math.floor((remainPlayerList.length%100)%10)}</p>
                            </span>
                        </div>
                    </div>
                    {spinBlock}
                    <div className="w-full mb-12">
                      <p className="font-[900] text-[#004599] uppercase text-[16px] text-center items-center">giải thưởng hiện tại</p>
                      <div className="h-44 px-4 py-2 relative">
                        {renderRewardList}
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 rounded-full h-10 w-10 bg-gradient-to-r from-[#003B93] to-[#00F0FF] p-1"
                        onClick={() => {document.getElementById("settingOverlay").classList.toggle('hidden')}}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 fill-white  hover:animate-[spin_1s_linear]">
                            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                        </svg>
                    </div>
                    {renderCurrEventDetail}
                    {renderSetting}
                    {renderAwardNotification}
                </div>
            </section>
            :<PageLoading />
        }
        </>
    );
}