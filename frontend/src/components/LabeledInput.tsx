import { ChangeEvent } from "react";

interface LabeledInputType {
   label: string;
   placeholder: string;
   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
   type? :string;
}



function LabeledInput ({label, placeholder, type, onChange }: LabeledInputType) {
  return (
    <div> 
      <p>{label}</p>
      <input placeholder={placeholder} onChange={onChange} type = {type ||"text"} />
    </div>
  )
}

export default LabeledInput