/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from "react";
import { useRouter } from "next/router"
import { v4 as uuidv4 } from "uuid"

import BgBlueButton from "public/shared/BgBlueButton";
import Reward from "components/RewardRegister/Reward";
import SingleColorButton from "public/shared/SingleColorButton";
import Header from "public/shared/Header";
// import NewReward from "components/RewardRegister/NewReward";


function EventRewardRegister () {
 
    // router
    const router = useRouter()

    // state
    const [giftCount, setGiftCount] = useState(1)
    const [giftName, setGiftName] = useState({})
    const [imageList, setImageList] = useState({})
    const [rewardList, setRewardList] = useState([])

    const onChangeHandlerRewardName = (e) =>
    {
        setGiftName(prev => ({...prev,[e.target.name]:e.target.value}))
    }

    const hanldeAddReward = () =>
    {
        setRewardList((prev) =>
            {
                let newList = [...prev, <Reward />]
                return newList
            })
    }

    const handleNavigate = () =>
    {
        if(giftName !== null)
        {
            router.push("/event/event-detail")
        }
    }

    return (
            <div className="flex flex-col items-center justify-between w-screen h-screen py-2">
                <div className="w-full flex flex-col items-center justify-center">
                    <Header />
                    <h1 className="uppercase text-xl py-2 mb-2 font-bold text-[#004599]">thông tin giải thưởng</h1>
                    <div className="flex flex-col items-center justify-center w-full">
                        <div className="overflow-y-auto overflow-x-hidden w-full max-h-[400px]">

                            {/* <Reward
                                name={"field1"}
                                valueRewardName={giftName.field1}
                                onChangeRewardName={onChangeHandlerRewardName}
                                valueGiftCount={giftCount}
                                onChangeGiftCountMinus={(e) => setGiftCount(Math.max(giftCount - 1, 1))}
                                onChangeGiftCountPlus={(e) => setGiftCount(giftCount + 1)}
                                fileID={"file1"}
                                toggleID={"toggle1"}
                            />
                            <Reward
                                name={"field2"}
                                valueRewardName={giftName.field2}
                                onChangeRewardName={onChangeHandlerRewardName}
                                valueGiftCount={giftCount}
                                onChangeGiftCountMinus={(e) => setGiftCount(Math.max(giftCount - 1, 1))}
                                onChangeGiftCountPlus={(e) => setGiftCount(giftCount + 1)}
                                fileID={"file2"}
                                toggleID={"toggle2"}
                            /> */}
                            {
                                rewardList.map((item, index) =>
                                {
                                    return (
                                        <div key={index}>
                                            {item}
                                        </div>
                                    )
                                })
                            }
                            
                        </div>

                        <div className="flex justify-center items-center mb-2 mt-1 w-3/4 lg:w-4/12 max-w-xl cursor-pointer drop-shadow-lg">
                            <SingleColorButton content={"Thêm giải thưởng"} colorHex={"#40BEE5"} onClick={hanldeAddReward}/>
                        </div> 

                    </div>
                </div>


                <div className="pb-4 w-3/4 lg:w-4/12 drop-shadow-lg max-w-xl">
                    <BgBlueButton content={"ĐĂNG KÝ SỰ KIỆN"} onClick={handleNavigate}/>
                </div>
            </div>
    )
}
export default EventRewardRegister