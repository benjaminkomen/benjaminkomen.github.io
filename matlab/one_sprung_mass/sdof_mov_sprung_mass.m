% Title: 			SDOF moving sprung mass
% Date: 			February 12, 2016
% Last modified: 	April 1, 2016
% Description: 		Analytical-numerical solver of one moving sprung mass on simply supported beam

clear all;
clc;

% 1. Defining variables
n				= 1;								% number of modes
L				= 25;								% length bridge [m]
g				= 9.81;								% gravitational acceleration [m/s^2]
m_vehicle		= 5750;								% mass [kg]
k_vehicle		= 1.595e6;							% spring stiffnes [N/m]
E_b				= 2.87e9;   						% Youngs modulus bridge [N/m^2]
m_bridge		= 2303;								% mass bridge [kg/m]
h_b             = 2.77;                             % height beam [m]
w_b             = 1.63;                             % width beam [m]
I_b				= (1/12)*w_b*h_b^3;					% Moment of inertia beam [m^4]
EI				= E_b*I_b;							% stiffness bridge [Nm^2]
v				= 100/3.6;							% velocity vehicle [m/s]
t0				= 0;								% start time [s]
tf				= 2*L/v;							% end time [s]
nsteps          = 55;                              % amount of time steps
tspan           = linspace(t0,tf,nsteps);           % timespan for solution [s]
Omega_bridge	= (n^2*pi^2)/L^2*sqrt(EI/m_bridge);	% frequency bridge (euler-bernoulli beam) [rad/s]
Omega_vehicle	= sqrt(k_vehicle/m_vehicle);		% frequency vehicle (mass-spring) [rad/s]

% Initial conditions
y_0				= [0; 0; 0; 0];						% initial conditions for the equation f1, f2, f3 and f4 of the solver

% 2. Solve system of ODE using ode45 runga kutta solver, pass on variables
[T,Y]			= ode45(@(t1,x) odesolver(t1,x,n,m_vehicle,v,m_bridge,L,g,Omega_bridge,Omega_vehicle),tspan,y_0);

% Explanation:
% T = output, array of time points with related solutions
% Y = output, array of solutions for every time point
% t1 = input, current time point parameter
% x = input, current location parameter
% the rest is input

% Extract parts of solution from rows of vector
x1				= Y(:,1);							% equal to qn, time related part of bridge deflection
x2				= Y(:,2);							% equal to first time derivative of qn
x3				= Y(:,3);							% equal to uw, mass deflection
x4				= Y(:,4);							% equal to first time derivate of uw

% Obtain full solution for the displacement of the bridge at midspan
r				= L/2;								% midspan [m]
M_shape			= sin(pi*r/L);                      % mode shape, will result in 1 for midspan
H_bridge_x		= x1.*M_shape;						% bridge vertical position [m]
H_vehicle_x		= x3;								% vehicle vertical position [m]

% Obtain velocities and accelerations by differentiation
dt              = T(2);

V_bridge_mid    = diff(H_bridge_x)./T(2);           % bridge velocity [m/s]
A_bridge_mid    = diff(V_bridge_mid)./T(2);         % bridge acceleration [m/s2]

V_vehicle       = diff(H_vehicle_x)./T(2);          % vehicle velocity [m/s]
A_vehicle       = diff(V_vehicle)./T(2);        % vehicle acceleration [m/s2]

% 3. Plot output
plot(T,H_bridge_x,'-r','LineWidth',1)
xlabel('Time [s]')
ylabel('Midpoint Displacement [m]')

ax = gca; % current axes
ax.XAxisLocation = 'origin';
ax.TickLength = [0.001 0.001];
ax.YTickLabel = {-0.003,-0.0025,-0.002,-0.0015,-0.001,-0.0005,0,0.0005};
ax.YLim = [-0.003 0.0005];

% 4. Write results to file
%bridge deflection
fileID 			= fopen('0.txt','w');
fprintf(fileID,'%9s %20.16f\n','timestep:', dt);
fprintf(fileID,'%25s \n','yAxisLabel:deflection [m]');
fprintf(fileID,'%23s \n','title:bridge deflection');
fprintf(fileID,'%13s \n','matlab ub_mid');
fprintf(fileID,'%20.16f\n', H_bridge_x);
fclose(fileID);

%sprung mass displacement
fileID 			= fopen('1.txt','w');
fprintf(fileID,'%9s %20.16f\n','timestep:', dt);
fprintf(fileID,'%27s \n','yAxisLabel:vertical DOF [m]');
fprintf(fileID,'%30s \n','title:sprung mass vertical DOF');
fprintf(fileID,'%10s \n','matlab uv1');
fprintf(fileID,'%20.16f\n', H_vehicle_x);
fclose(fileID);

%sprung mass velocity
fileID 			= fopen('2.txt','w');
fprintf(fileID,'%9s %20.16f\n','timestep:', dt);
fprintf(fileID,'%25s \n','yAxisLabel:velocity [m/s]');
fprintf(fileID,'%26s \n','title:sprung mass velocity');
fprintf(fileID,'%10s \n','matlab vv1');
fprintf(fileID,'%20.16f\n', V_vehicle);
fclose(fileID);

%sprung mass acceleration
fileID 			= fopen('3.txt','w');
fprintf(fileID,'%9s %20.16f\n','timestep:', dt);
fprintf(fileID,'%30s \n','yAxisLabel:acceleration [m/s2]');
fprintf(fileID,'%30s \n','title:sprung mass acceleration');
fprintf(fileID,'%10s \n','matlab av1');
fprintf(fileID,'%20.16f\n', A_vehicle);
fclose(fileID);