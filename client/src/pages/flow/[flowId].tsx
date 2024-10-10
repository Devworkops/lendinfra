import { useRouter } from 'next/router'
import Workflow from '../../components/flow/Workflow'
const GetFlow = () => {
  const router = useRouter()
  const { flowId } = router.query
  // const { auth } = useAuth();
  return (
    <Workflow flowId={flowId}></Workflow>)
}

export default GetFlow
