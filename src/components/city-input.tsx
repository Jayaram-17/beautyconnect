import { useId } from "react";

const indianCities = [
  "Agra", "Ahmedabad", "Ajmer", "Aligarh", "Amritsar", "Asansol", "Aurangabad", "Bengaluru", "Bhopal", "Bhubaneswar",
  "Chandigarh", "Chennai", "Coimbatore", "Dehradun", "Delhi", "Dhanbad", "Faridabad", "Ghaziabad", "Goa", "Guwahati",
  "Gwalior", "Hubballi", "Hyderabad", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jammu", "Jamshedpur", "Jodhpur",
  "Kanpur", "Kochi", "Kolkata", "Kota", "Kozhikode", "Lucknow", "Ludhiana", "Madurai", "Meerut", "Mumbai", "Mysuru",
  "Nagpur", "Nashik", "Noida", "Patna", "Pimpri-Chinchwad", "Prayagraj", "Pune", "Raipur", "Rajkot", "Ranchi",
  "Srinagar", "Surat", "Thane", "Thiruvananthapuram", "Tiruchirappalli", "Udaipur", "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam",
];

type CityInputProps = { value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; className?: string };

export function CityInput({ value, onChange, placeholder = "Start typing your city", required, className }: CityInputProps) {
  const listId = useId();
  const query = value.trim().toLocaleLowerCase();
  const suggestions = (query ? indianCities.filter((city) => city.toLocaleLowerCase().includes(query)) : indianCities).slice(0, 8);
  return <><input required={required} value={value} onChange={(event) => onChange(event.target.value)} list={listId} placeholder={placeholder} className={className} /><datalist id={listId}>{suggestions.map((city) => <option key={city} value={city} />)}</datalist></>;
}
