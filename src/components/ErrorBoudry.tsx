import { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  error: Error | null
  hasError: boolean
}

class ErrorBoundry extends Component<Props, State> {
  public state: State = {
    error: null,
    hasError: false
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(error: Error): State {
    return { error:error, hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
//      return (<>there was an error.</>)
      return this.props.fallback
    }

    return this.props.children
  }
}

export default ErrorBoundry