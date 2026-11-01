import { redirect } from 'next/navigation';

// The Archive page was removed (it repeated the Work page). Old links land on Work instead.
export default function Archive() {
  redirect('/work');
}
