@extends('layouts.login_master')

@section('content')
    <div class="page-content login-cover">

        <div class="content-wrapper">
    <div class="content d-flex justify-content-center align-items-center">

        <!-- Password recovery form -->
        <form class="login-form" method="POST" action="{{ route('password.email') }}">
            @csrf
            <div class="card mb-0">
                <div class="card-body">

                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif
                        @if ($errors->has('email'))
                            <div class="alert alert-danger" role="alert">
                                {{ $errors->first('email') }}
                            </div>
                        @endif

                                        <div class="text-center mb-3">
                        <img src="{{ Qs::getLogo() }}" alt="{{ Qs::getSystemName() }}" style="height: 52px; width: auto; max-width: 230px;" class="mb-3 mt-1">
                        <h5 class="mb-0 font-weight-bold" style="color: #166534;">Password recovery</h5>
                        <span class="d-block text-muted">We'll send you instructions in email</span>
                    </div>

                    <div class="form-group ">
                        <input name="email" required type="email" class="form-control" value="{{ old('email') }}" placeholder="Your email">
                    </div>

                    <button type="submit" class="btn btn-primary btn-block"><i class="icon-spinner11 mr-2"></i> Reset password</button>
                </div>
            </div>
        </form>
        <!-- /password recovery form -->

    </div>
    </div>
    </div>
@endsection
